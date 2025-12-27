from PIL import Image
import io

def encode_message(image_bytes, message):
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    encoded = img.copy()
    width, height = img.size
    message += "####" # Delimiter
    binary_msg = ''.join(format(ord(i), '08b') for i in message)
    
    data_index = 0
    pixels = encoded.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if data_index < len(binary_msg):
                r = (r & ~1) | int(binary_msg[data_index])
                data_index += 1
            pixels[x, y] = (r, g, b)
            if data_index >= len(binary_msg):
                break
        if data_index >= len(binary_msg):
            break
            
    img_byte_arr = io.BytesIO()
    encoded.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def decode_message(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    pixels = img.load()
    binary_msg = ""
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = pixels[x, y]
            binary_msg += str(r & 1)
    
    # Convert bits to chars
    chars = [binary_msg[i:i+8] for i in range(0, len(binary_msg), 8)]
    message = ""
    for char in chars:
        message += chr(int(char, 2))
        if "####" in message:
            return message.replace("####", "")
    return message