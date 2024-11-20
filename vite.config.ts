import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// 自定义的 Vite 插件
const addHeadersPlugin = () => {
  return {
    name: 'add-headers-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes('ffmpeg')) {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vueJsx(),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        // Specify symbolId format
        symbolId: 'icon-[name]'
      }),
      addHeadersPlugin(),
      {
        name: 'configure-response-headers',
        configureServer: (server) => {
          server.middlewares.use((req, res, next) => {
            if (req.url?.includes('ffmpeg')) {
              res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
              res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            }
            next()
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        // 代理的路径
        '/api': {
          target: env.VITE_API_PROXY_URL,
          changeOrigin: true // 是否改变请求源
        },
        '/@ffmpeg': {
          target: 'https://unpkg.com',
          changeOrigin: true,
          configure: (proxy, options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              if (req.url?.includes('ffmpeg')) {
                proxyRes.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
                proxyRes.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
              }
            })
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
    publicDir: 'public'
  }
})
