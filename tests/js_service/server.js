const express = require('express');
const LZString = require('lz-string');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'lean4url-test-service' });
});

// Compression endpoint
app.post('/compress', (req, res) => {
    try {
        const { input, method = 'compressToBase64' } = req.body;
        
        if (!input && input !== '') {
            return res.status(400).json({ error: 'No input provided' });
        }

        let result;
        switch (method) {
            case 'compressToBase64':
                result = LZString.compressToBase64(input);
                break;
            case 'compressToUTF16':
                result = LZString.compressToUTF16(input);
                break;
            case 'compress':
                result = LZString.compress(input);
                break;
            default:
                return res.status(400).json({ error: `Unknown method: ${method}` });
        }

        if (result === null || result === undefined) {
            return res.status(500).json({ error: 'Compression failed' });
        }

        return res.json({
            input,
            method,
            output: result,
            inputLength: input.length,
            outputLength: result.length,
            compressionRatio: input.length > 0 ? ((1 - result.length / input.length) * 100).toFixed(2) + '%' : '0%'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Decompression endpoint
app.post('/decompress', (req, res) => {
    try {
        const { input, method = 'decompressFromBase64' } = req.body;
        
        if (!input && input !== '') {
            return res.status(400).json({ error: 'No input provided' });
        }

        let result;
        switch (method) {
            case 'decompressFromBase64':
                result = LZString.decompressFromBase64(input);
                break;
            case 'decompressFromUTF16':
                result = LZString.decompressFromUTF16(input);
                break;
            case 'decompress':
                result = LZString.decompress(input);
                break;
            default:
                return res.status(400).json({ error: `Unknown method: ${method}` });
        }

        if (result === null) {
            return res.status(500).json({ error: 'Decompression failed' });
        }

        return res.json({
            input,
            method,
            output: result,
            inputLength: input.length,
            outputLength: result ? result.length : 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Batch test endpoint
app.post('/batch-test', (req, res) => {
    try {
        const { testCases } = req.body;
        
        if (!Array.isArray(testCases)) {
            return res.status(400).json({ error: 'testCases must be an array' });
        }

        const results = testCases.map((testCase, index) => {
            try {
                const { input, method = 'compressToBase64' } = testCase;
                
                let compressed, decompressed;
                
                switch (method) {
                    case 'compressToBase64':
                        compressed = LZString.compressToBase64(input);
                        decompressed = LZString.decompressFromBase64(compressed);
                        break;
                    case 'compressToUTF16':
                        compressed = LZString.compressToUTF16(input);
                        decompressed = LZString.decompressFromUTF16(compressed);
                        break;
                    default:
                        throw new Error(`Unsupported method: ${method}`);
                }
                
                return {
                    index,
                    input,
                    method,
                    compressed,
                    decompressed,
                    success: input === decompressed,
                    inputLength: input.length,
                    compressedLength: compressed ? compressed.length : 0
                };
            } catch (error) {
                return {
                    index,
                    input: testCase.input || '',
                    method: testCase.method || 'compressToBase64',
                    error: error.message,
                    success: false
                };
            }
        });

        const successCount = results.filter(r => r.success).length;
        
        return res.json({
            results,
            summary: {
                total: testCases.length,
                successful: successCount,
                failed: testCases.length - successCount,
                successRate: testCases.length > 0 ? ((successCount / testCases.length) * 100).toFixed(2) + '%' : '0%'
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Special Unicode test endpoint
app.get('/unicode-test/:char', (req, res) => {
    try {
        const char = decodeURIComponent(req.params.char);
        
        // Get character details
        const charCode = char.codePointAt(0);
        const charCodes = [];
        for (let i = 0; i < char.length; i++) {
            charCodes.push(char.charCodeAt(i));
        }
        
        // Test compression
        const compressed = LZString.compressToBase64(char);
        const decompressed = LZString.decompressFromBase64(compressed);
        
        return res.json({
            character: char,
            unicode: {
                codePoint: charCode,
                hex: '0x' + charCode.toString(16).toUpperCase(),
                charCodes: charCodes,
                length: char.length
            },
            compression: {
                original: char,
                compressed,
                decompressed,
                successful: char === decompressed,
                originalLength: char.length,
                compressedLength: compressed.length
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 lean4url JavaScript test service running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoints available:`);
    console.log(`   POST /compress - Compress strings`);
    console.log(`   POST /decompress - Decompress strings`);
    console.log(`   POST /batch-test - Run batch tests`);
    console.log(`   GET /unicode-test/:char - Test specific Unicode characters`);
});
