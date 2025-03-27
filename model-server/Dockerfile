# Use the official TensorFlow Serving GPU image (~1.5-2 GB)
FROM tensorflow/serving:latest-gpu

# Set working directory
WORKDIR /models

# Copy your SavedModel
COPY ./saved_model /models/my_model

# Set environment variables
ENV MODEL_NAME=my_model
ENV PORT=8501

# Expose the REST API port
EXPOSE 8501

# Start TensorFlow Serving
ENTRYPOINT ["tensorflow_model_server", "--port=8501", "--rest_api_port=8501", "--model_name=${MODEL_NAME}", "--model_base_path=/models/${MODEL_NAME}"]