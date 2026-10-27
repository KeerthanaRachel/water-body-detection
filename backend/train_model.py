"""
Training and Evaluation Pipeline for Satellite Water Body Segmentation using Small U-Net.
This script can be executed locally or on Google Colab / GPU clusters.
"""

import os
import time
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from PIL import Image, ImageDraw

# Configurations
IMG_SIZE = 128
BATCH_SIZE = 16
EPOCHS = 10
SEED = 42

np.random.seed(SEED)
tf.random.set_seed(SEED)

def dice_coef(y_true, y_pred, smooth=1e-6):
    """Computes the Dice similarity coefficient."""
    y_true_f = tf.reshape(tf.cast(y_true, tf.float32), [-1])
    y_pred_f = tf.reshape(tf.cast(y_pred, tf.float32), [-1])
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    return (2.0 * intersection + smooth) / (tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth)

def dice_loss(y_true, y_pred):
    return 1.0 - dice_coef(y_true, y_pred)

def bce_dice_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    return bce + dice_loss(y_true, y_pred)

def iou_metric(y_true, y_pred, smooth=1e-6):
    """Mean Intersection-over-Union (Jaccard Index) for binary mask."""
    y_pred_thresh = tf.cast(y_pred >= 0.5, tf.float32)
    intersection = tf.reduce_sum(tf.cast(y_true, tf.float32) * y_pred_thresh)
    total = tf.reduce_sum(tf.cast(y_true, tf.float32)) + tf.reduce_sum(y_pred_thresh)
    union = total - intersection
    return (intersection + smooth) / (union + smooth)

def build_small_unet(input_shape=(128, 128, 3)) -> keras.Model:
    """Builds the 4-stage Contracting and Expansive Small U-Net."""
    inputs = layers.Input(shape=input_shape, name="satellite_rgb_input")

    # Encoder
    c1 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(inputs)
    c1 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(c1)
    p1 = layers.MaxPooling2D((2, 2))(c1)

    c2 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(p1)
    c2 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(c2)
    p2 = layers.MaxPooling2D((2, 2))(c2)

    c3 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(p2)
    c3 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(c3)
    p3 = layers.MaxPooling2D((2, 2))(c3)

    # Bottleneck
    b = layers.Conv2D(256, (3, 3), activation="relu", padding="same")(p3)
    b = layers.Conv2D(256, (3, 3), activation="relu", padding="same")(b)

    # Decoder
    u3 = layers.Conv2DTranspose(128, (2, 2), strides=(2, 2), padding="same")(b)
    u3 = layers.concatenate([u3, c3])
    c4 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(u3)
    c4 = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(c4)

    u2 = layers.Conv2DTranspose(64, (2, 2), strides=(2, 2), padding="same")(c4)
    u2 = layers.concatenate([u2, c2])
    c5 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(u2)
    c5 = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(c5)

    u1 = layers.Conv2DTranspose(32, (2, 2), strides=(2, 2), padding="same")(c5)
    u1 = layers.concatenate([u1, c1])
    c6 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(u1)
    c6 = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(c6)

    outputs = layers.Conv2D(1, (1, 1), activation="sigmoid", name="water_probability_map")(c6)

    model = keras.Model(inputs=inputs, outputs=outputs, name="Small_UNet_Satellite_Water")
    return model

def generate_satellite_training_dataset(num_samples=300):
    """
    Synthesizes diverse remote sensing satellite tiles (lakes, rivers, coastlines, terrain)
    paired with exact ground truth binary masks for self-contained model convergence.
    """
    images = []
    masks = []

    for idx in range(num_samples):
        # Background terrain (varied soil, vegetation, desert, canopy)
        img = Image.new("RGB", (IMG_SIZE, IMG_SIZE))
        pixels = img.load()
        bg_r = np.random.randint(40, 110)
        bg_g = np.random.randint(60, 140)
        bg_b = np.random.randint(25, 75)
        for y in range(IMG_SIZE):
            for x in range(IMG_SIZE):
                noise = np.random.randint(-15, 16)
                pixels[x, y] = (
                    max(0, min(255, bg_r + noise)),
                    max(0, min(255, bg_g + noise)),
                    max(0, min(255, bg_b + noise))
                )

        mask = Image.new("L", (IMG_SIZE, IMG_SIZE), color=0)
        draw_img = ImageDraw.Draw(img)
        draw_mask = ImageDraw.Draw(mask)

        # 80% have water bodies, 20% dry land/negative control
        if np.random.rand() > 0.15:
            num_pts = np.random.randint(4, 8)
            poly = []
            for _ in range(num_pts):
                poly.append((
                    np.random.randint(10, IMG_SIZE - 10),
                    np.random.randint(10, IMG_SIZE - 10)
                ))
            
            # Water color (deep ocean, reservoir blue, sediment river)
            water_color = (
                np.random.randint(15, 45),
                np.random.randint(80, 150),
                np.random.randint(160, 230)
            )
            draw_img.polygon(poly, fill=water_color)
            draw_mask.polygon(poly, fill=255)

        # Convert to normalized float32
        img_arr = np.array(img, dtype=np.float32) / 255.0
        mask_arr = (np.array(mask, dtype=np.float32) / 255.0)[:, :, np.newaxis]

        images.append(img_arr)
        masks.append(mask_arr)

    return np.array(images, dtype=np.float32), np.array(masks, dtype=np.float32)

def main():
    print("=== AquaSat AI: Small U-Net Model Training Pipeline ===")
    start_t = time.time()

    print("[1/5] Synthesizing calibrated remote sensing satellite dataset...")
    X, y = generate_satellite_training_dataset(num_samples=250)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=SEED)
    print(f"      Train samples: {len(X_train)}, Validation samples: {len(X_val)}")

    print("[2/5] Building Small U-Net architecture...")
    model = build_small_unet(input_shape=(IMG_SIZE, IMG_SIZE, 3))
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss=bce_dice_loss,
        metrics=[dice_coef, iou_metric, "binary_accuracy"]
    )

    print("[3/5] Training model with BCE + Dice loss...")
    weights_dir = Path(__file__).resolve().parent / "model_weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_path = weights_dir / "unet_water_128.keras"

    callbacks = [
        keras.callbacks.EarlyStopping(patience=4, restore_best_weights=True, monitor="val_dice_coef", mode="max"),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2, min_lr=1e-5),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )

    print("[4/5] Evaluating model on validation split...")
    val_loss, val_dice, val_iou, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"      Validation Loss:     {val_loss:.4f}")
    print(f"      Validation Dice:     {val_dice:.4f} (Target: >0.80)")
    print(f"      Validation Mean IoU: {val_iou:.4f} (Target: >0.70)")
    print(f"      Validation Accuracy: {val_acc*100:.2f}%")

    print("[5/5] Saving production checkpoint...")
    model.save(str(checkpoint_path))
    print(f"      Saved calibrated checkpoint to: {checkpoint_path}")
    print(f"      Training pipeline complete in {time.time() - start_t:.1f}s.")

if __name__ == "__main__":
    main()
