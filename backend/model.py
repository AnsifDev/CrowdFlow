from io import BytesIO
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import keras

def load_image(file):
    image = Image.open(BytesIO(file.read())).convert('RGB')
    image = np.array(image, dtype=np.float32)
    image = image / 255.0
    image = np.expand_dims(image, axis=0)
    return image

model = keras.models.load_model('CSRNet.keras')
model.summary()

def predict_count(file):
    input_image = load_image(file)
    
    density_map = model.predict(input_image)
    density_map = np.squeeze(density_map, axis=0)
    density_map = np.squeeze(density_map, axis=-1)

    count = np.sum(density_map)
    return count