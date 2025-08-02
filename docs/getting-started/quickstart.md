# Quick Start

## Basic Compression/Decompression

```python
from lean4url import LZString

# Create instance
lz = LZString()

# Compress string
original = "Hello, 世界! 🌍"
compressed = lz.compress_to_base64(original)
print(f"Compressed: {compressed}")

# Decompress string
decompressed = lz.decompress_from_base64(compressed)
print(f"Decompressed: {decompressed}")
# Output: Hello, 世界! 🌍
```

## URL Encoding/Decoding

```python
from lean4url import encode_url, decode_url

# Encode data to URL
data = "This is data to be encoded"
url = encode_url(data, base_url="https://example.com/share")
print(f"Encoded URL: {url}")
# Output: https://example.com/share/#codez=BIUwNmD2A0AEDukBOYAmBMYAZhAY...

# Decode data from URL
result = decode_url(url)
print(f"Decoded result: {result['codez']}")
# Output: This is data to be encoded
```

## URL Encoding with Parameters

```python
from lean4url import encode_url, decode_url

# Encode with additional parameters
code = "function hello() { return 'world'; }"
url = encode_url(
    code, 
    base_url="https://playground.example.com",
    lang="javascript",
    theme="dark",
    url="https://docs.example.com"  # This parameter will be URL encoded
)

print(f"Complete URL: {url}")
# Output: https://playground.example.com/#codez=BIUwNmD2A0A...&lang=javascript&theme=dark&url=https%3A//docs.example.com

# Decode URL to get all parameters
params = decode_url(url)
print(f"Code: {params['codez']}")
print(f"Language: {params['lang']}")
```