# 快速开始

## 基础压缩/解压

```python
from lean4url import LZString

# 创建实例
lz = LZString()

# 压缩字符串
original = "Hello, 世界! 🌍"
compressed = lz.compress_to_base64(original)
print(f"压缩后: {compressed}")

# 解压字符串
decompressed = lz.decompress_from_base64(compressed)
print(f"解压后: {decompressed}")
# 输出: Hello, 世界! 🌍
```

## URL 编码/解码

```python
from lean4url import encode_url, decode_url

# 编码数据到 URL
data = "这是需要编码的数据"
url = encode_url(data, base_url="https://example.com/share")
print(f"编码后的 URL: {url}")
# 输出: https://example.com/share/#codez=BIUwNmD2A0AEDukBOYAmBMYAZhAY...

# 从 URL 解码数据
result = decode_url(url)
print(f"解码结果: {result['codez']}")
# 输出: 这是需要编码的数据
```

## 带参数的 URL 编码

```python
from lean4url import encode_url, decode_url

# 编码时添加额外参数
code = "function hello() { return 'world'; }"
url = encode_url(
    code, 
    base_url="https://playground.example.com",
    lang="javascript",
    theme="dark",
    url="https://docs.example.com"  # 这个参数会被 URL 编码
)

print(f"完整 URL: {url}")
# 输出: https://playground.example.com/#codez=BIUwNmD2A0A...&lang=javascript&theme=dark&url=https%3A//docs.example.com

# 解码 URL 获取所有参数
params = decode_url(url)
print(f"代码: {params['codez']}")
print(f"语言: {params['lang']}")
```