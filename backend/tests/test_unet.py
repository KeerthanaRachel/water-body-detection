import pytest
import numpy as np
from PIL import Image
from app.services.unet_model import build_small_unet, UNetInferenceService

def test_unet_architecture_shapes():
    """Verify small U-Net input and output layer dimensions and activation."""
    model = build_small_unet(input_shape=(128, 128, 3))
    assert model.input_shape == (None, 128, 128, 3)
    assert model.output_shape == (None, 128, 128, 1)
    
    # Check that final activation is sigmoid
    last_layer = model.layers[-1]
    assert last_layer.activation.__name__ == "sigmoid"

def test_unet_inference_and_metrics():
    """Verify inference pipeline, binary thresholding, and percentage calculation."""
    service = UNetInferenceService()
    assert service.is_loaded is True

    # Create synthetic 300x200 RGB satellite test image (tests non-square inputs)
    orig_w, orig_h = 300, 200
    test_img = Image.new("RGB", (orig_w, orig_h), color=(30, 80, 150)) # Deep water tone
    result = service.predict(test_img)

    # Validate output structure
    assert "binary_mask" in result
    assert "mask_128" in result
    assert "overlay_image" in result
    assert "water_percentage" in result
    assert "processing_time_ms" in result
    assert "image_width" in result
    assert "image_height" in result

    # Check that mask was correctly resized back to match original input image dimensions
    assert result["image_width"] == orig_w
    assert result["image_height"] == orig_h
    assert result["binary_mask"].size == (orig_w, orig_h)
    assert result["overlay_image"].size == (orig_w, orig_h)
    assert result["mask_128"].size == (128, 128)

    # Check binary mask values (strictly 0 or 255, no intermediate grayscale values)
    mask_arr = np.array(result["mask_128"])
    unique_vals = set(np.unique(mask_arr))
    assert unique_vals.issubset({0, 255})

    # Check water coverage bounds
    assert 0.0 <= result["water_percentage"] <= 100.0
    assert result["processing_time_ms"] > 0.0

def test_water_percentage_calculation_precision():
    """Directly test the mathematical percentage formula from binary mask array."""
    mask_arr = np.zeros((128, 128), dtype=np.uint8)
    # Set exactly 4096 pixels out of 16384 to 255 (exactly 25.0%)
    mask_arr[:64, :64] = 255
    total_pixels = 128 * 128
    water_pixels = int(np.count_nonzero(mask_arr))
    pct = (water_pixels / total_pixels) * 100.0
    assert pct == 25.0
