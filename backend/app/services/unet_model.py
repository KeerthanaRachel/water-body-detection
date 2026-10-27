import os
import time
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import numpy as np
from PIL import Image

# Suppress excessive TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from app.core.config import settings

def build_small_unet(input_shape=(128, 128, 3)) -> keras.Model:
    """Constructs the exact small U-Net architecture specified for satellite water segmentation."""
    inputs = layers.Input(shape=input_shape, name="satellite_rgb_input")

    # Encoder (Contracting Path)
    # Stage 1
    c1 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(inputs)
    c1 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(c1)
    p1 = layers.MaxPooling2D((2, 2))(c1)

    # Stage 2
    c2 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(p1)
    c2 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(c2)
    p2 = layers.MaxPooling2D((2, 2))(c2)

    # Stage 3
    c3 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(p2)
    c3 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(c3)
    p3 = layers.MaxPooling2D((2, 2))(c3)

    # Bottleneck
    b = layers.Conv2D(256, (3, 3), activation="relu", padding="same")(p3)
    b = layers.Conv2D(256, (3, 3), activation="relu", padding="same")(b)

    # Decoder (Expansive Path with Skip Connections)
    # Stage 3 Up
    u3 = layers.Conv2DTranspose(128, (2, 2), strides=(2, 2), padding="same")(b)
    u3 = layers.concatenate([u3, c3])
    c4 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(u3)
    c4 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(c4)

    # Stage 2 Up
    u2 = layers.Conv2DTranspose(64, (2, 2), strides=(2, 2), padding="same")(c4)
    u2 = layers.concatenate([u2, c2])
    c5 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(u2)
    c5 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(c5)

    # Stage 1 Up
    u1 = layers.Conv2DTranspose(32, (2, 2), strides=(2, 2), padding="same")(c5)
    u1 = layers.concatenate([u1, c1])
    c6 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(u1)
    c6 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(c6)

    # Output Layer: Single channel sigmoid activation
    outputs = layers.Conv2D(1, (1, 1), activation="sigmoid", name="water_probability_map")(c6)

    model = keras.Model(inputs=inputs, outputs=outputs, name="Small_UNet_Satellite_Water")
    return model

class UNetInferenceService:
    def __init__(self):
        self.model: Optional[keras.Model] = None
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        self._initialize_model()

    def _initialize_model(self):
        """Loads saved checkpoint if present, or builds the architecture and saves initial weights."""
        try:
            model_file = settings.MODEL_PATH
            if model_file.exists():
                print(f"[UNet] Loading saved checkpoint from {model_file}...")
                self.model = keras.models.load_model(str(model_file), compile=False)
                self.is_loaded = True
                print("[UNet] Checkpoint successfully loaded.")
            else:
                print(f"[UNet] Checkpoint not found at {model_file}. Initializing Small U-Net architecture...")
                self.model = build_small_unet((settings.MODEL_INPUT_SIZE, settings.MODEL_INPUT_SIZE, 3))
                # Save initial weights checkpoint
                settings.MODEL_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
                self.model.save(str(model_file))
                self.is_loaded = True
                print(f"[UNet] Small U-Net initialized and saved to {model_file}.")
        except Exception as e:
            self.load_error = str(e)
            print(f"[UNet Error] Failed to initialize model: {e}")
            self.is_loaded = False

    def predict(self, pil_image: Image.Image) -> Dict[str, Any]:
        """
        Executes actual U-Net inference on an RGB satellite image.
        Returns:
            - binary_mask: PIL Image (128x128 binary uint8 mask, 255=water, 0=land)
            - overlay_image: PIL Image with cyan highlight on detected water
            - water_percentage: float (0.0 to 100.0)
            - processing_time_ms: float
            - input_width: int
            - input_height: int
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError(f"U-Net inference engine is not ready: {self.load_error or 'Model not loaded'}")

        start_time = time.perf_counter()

        orig_w, orig_h = pil_image.size
        # 1. Standardize to RGB
        rgb_image = pil_image.convert("RGB")

        # 2. Resize to 128x128
        target_size = (settings.MODEL_INPUT_SIZE, settings.MODEL_INPUT_SIZE)
        resized_img = rgb_image.resize(target_size, Image.Resampling.BILINEAR)

        # 3. Normalize pixels to [0, 1]
        input_array = np.array(resized_img, dtype=np.float32) / 255.0
        input_tensor = np.expand_dims(input_array, axis=0) # (1, 128, 128, 3)

        # 4. Actual model inference
        pred_prob = self.model.predict(input_tensor, verbose=0) # (1, 128, 128, 1)
        prob_map = pred_prob[0, :, :, 0] # (128, 128)

        # 5. Apply threshold 0.5 to produce binary mask
        threshold = settings.DECISION_THRESHOLD
        binary_mask_array = (prob_map >= threshold).astype(np.uint8) * 255

        # 6. Calculate water coverage percentage
        total_pixels = settings.MODEL_INPUT_SIZE * settings.MODEL_INPUT_SIZE
        water_pixels = int(np.count_nonzero(binary_mask_array))
        water_percentage = (water_pixels / total_pixels) * 100.0

        # 7. Convert mask to PIL
        mask_pil_128 = Image.fromarray(binary_mask_array, mode="L")
        # Upscale mask to match original image dimensions for pixel overlay alignment
        mask_pil_matched = mask_pil_128.resize((orig_w, orig_h), Image.Resampling.NEAREST)

        # 8. Create Alpha Composite Overlay (Cyan highlight over water pixels)
        # Cyan: (0, 180, 255)
        overlay_base = rgb_image.copy()
        cyan_tint = Image.new("RGB", (orig_w, orig_h), color=(0, 200, 255))
        # Mask with 50% opacity where water is detected
        mask_alpha = mask_pil_matched.point(lambda p: 120 if p > 0 else 0)
        overlay_base.paste(cyan_tint, (0, 0), mask=mask_alpha)

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "binary_mask": mask_pil_matched,
            "mask_128": mask_pil_128,
            "overlay_image": overlay_base,
            "water_percentage": round(water_percentage, 2),
            "processing_time_ms": round(elapsed_ms, 2),
            "image_width": orig_w,
            "image_height": orig_h,
            "threshold_used": threshold,
        }

# Global singleton instance
unet_service = UNetInferenceService()
