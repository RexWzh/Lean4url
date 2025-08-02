# lean4url

[![PyPI version](https://badge.fury.io/py/lean4url.svg)](https://badge.fury.io/py/lean4url)
[![Python Version](https://img.shields.io/pypi/pyversions/lean4url.svg)](https://pypi.org/project/lean4url/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/rexwzh/lean4url/workflows/Tests/badge.svg)](https://github.com/rexwzh/lean4url/actions)
[![Coverage](https://codecov.io/gh/rexwzh/lean4url/branch/main/graph/badge.svg)](https://codecov.io/gh/rexwzh/lean4url)

一个高性能的 lzstring 压缩库，与 JavaScript 实现完全兼容。

## 特性

✅ **完全兼容** - 与 [pieroxy/lz-string](https://github.com/pieroxy/lz-string) JavaScript 实现 100% 兼容

✅ **Unicode 支持** - 正确处理所有 Unicode 字符，包括 emoji 和特殊符号

✅ **URL 友好** - 内置 URL 编码/解码功能

✅ **高性能** - 优化的算法实现

✅ **类型安全** - 完整的类型注解支持

✅ **全面测试** - 包含与 JavaScript 版本的对比测试

## 背景

现有的 Python lzstring 包存在 Unicode 字符处理问题。例如，对于字符 "𝔓"：

- **现有包输出**: `sirQ`
- **JavaScript 原版输出**: `qwbmRdo=`
- **lean4url 输出**: `qwbmRdo=` ✅

lean4url 通过正确模拟 JavaScript 的 UTF-16 编码行为，解决了这一问题。

## 安装

```bash
pip install lean4url
```

## 快速开始

### 基础压缩/解压

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

### URL 编码/解码

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

### 带参数的 URL 编码

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
print(f"主题: {params['theme']}")
print(f"文档链接: {params['url']}")
```

## API 参考

### LZString 类

```python
class LZString:
    def compress_to_base64(self, input_str: str) -> str:
        """压缩字符串到 Base64 格式"""
        
    def decompress_from_base64(self, input_str: str) -> str:
        """从 Base64 格式解压字符串"""
        
    def compress_to_utf16(self, input_str: str) -> str:
        """压缩字符串到 UTF16 格式"""
        
    def decompress_from_utf16(self, input_str: str) -> str:
        """从 UTF16 格式解压字符串"""
```

### URL 功能函数

```python
def encode_url(data: str, base_url: str = None, **kwargs) -> str:
    """
    编码输入字符串并构建完整 URL。
    
    Args:
        data: 需要编码的数据
        base_url: URL 前缀
        **kwargs: 额外的 URL 参数
        
    Returns:
        构建的完整 URL
    """

def decode_url(url: str) -> dict:
    """
    从 URL 解码原始数据。
    
    Args:
        url: 完整的 URL
        
    Returns:
        包含所有参数的字典，其中 codez 已解码
    """
```

## 开发

### 环境配置

```bash
# 克隆仓库
git clone https://github.com/rexwzh/lean4url.git
cd lean4url

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装开发依赖
pip install -e ".[dev]"
```

### 运行测试

```bash
# 启动 JavaScript 测试服务
cd tests/js_service
npm install
node server.js &
cd ../..

# 运行 Python 测试
pytest

# 运行带覆盖率的测试
pytest --cov=lean4url --cov-report=html
```

### 代码格式化

```bash
# 格式化代码
black src tests
isort src tests

# 类型检查
mypy src

# 代码检查
flake8 src tests
```

## 算法原理

lean4url 基于 LZ78 压缩算法的变体，核心思想是：

1. **字典构建** - 动态构建字符序列字典
2. **序列匹配** - 寻找最长匹配序列
3. **UTF-16 兼容** - 模拟 JavaScript 的 UTF-16 代理对行为
4. **Base64 编码** - 将压缩结果编码为 URL 安全格式

### Unicode 处理

与现有 Python 包的关键差异在于 Unicode 字符处理：

- **JavaScript**: 使用 UTF-16 代理对，"𝔓" → `[0xD835, 0xDCD3]`
- **现有 Python 包**: 使用 Unicode 码位，"𝔓" → `[0x1D4D3]`
- **lean4url**: 模拟 JavaScript 行为，确保兼容性

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的 lzstring 算法实现
- JavaScript 兼容性
- URL 编码/解码功能
- 完整的测试套件
