import { defineConfig } from 'wxt';
import packageJson from './package.json';
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major = '1', minor = '0', patch = '0', label = '1'] = version
    // can only contain digits, dots, or dash
    .replace(/[^\d.-]+/g, '')
    // split into version parts
    .split(/[.-]/);

// See https://wxt.dev/api/config.html
export default defineConfig({

    manifest: ({ browser, manifestVersion, mode, command }) => {
        return {
            name: mode === 'development' ? '快速收藏(测试)' : '快速收藏',
            version: `${major}.${minor}.${patch}.${label}`,
            version_name: version,
            // 功能允许,可能需要使用的功能,请在这里写入
            permissions: [
                'sidePanel',
                "bookmarks",
                "storage",
                "webRequest",
                "activeTab",
                "tabs"
            ],
            // 允许存在的域名,我这样写,基本可以通吃所有网址
            host_permissions: [
                "file:///\*/\*",
                "http://\*/\*",
                "https://\*/\*",
            ],
            content_security_policy: {
                extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"

            }
            // ...
        };
    },

    modules: ['@wxt-dev/module-vue'],
});
