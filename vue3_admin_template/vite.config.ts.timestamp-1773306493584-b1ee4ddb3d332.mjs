// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/work/Java-Projects/1WebFrontend/6vue3manage/0origincode/vue3_admin_template/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/work/Java-Projects/1WebFrontend/6vue3manage/0origincode/vue3_admin_template/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import { createSvgIconsPlugin } from "file:///D:/work/Java-Projects/1WebFrontend/6vue3manage/0origincode/vue3_admin_template/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import { viteMockServe } from "file:///D:/work/Java-Projects/1WebFrontend/6vue3manage/0origincode/vue3_admin_template/node_modules/vite-plugin-mock/dist/index.js";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    // publicPath: 'https://gitee.com/jch1011/guiguzhenxuan',
    // publicPath: 'http://localhost:3000',
    base: "/",
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
      viteMockServe({
        // localEnabled: command === 'serve', //保证开发阶段可以使用mock接口
        localEnabled: false
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src")
        // 相对路径别名配置，使用 @ 代替 src
      }
    },
    //scss全局变量一个配置
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: '@import "./src/styles/variable.scss";'
        }
      }
    },
    //代理跨域
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          //获取数据的服务器地址设置
          // target: env.VITE_SERVE,
          target: "http://localhost:3000",
          //需要代理跨域
          changeOrigin: true,
          //路径重写
          // rewrite: (path) => path.replace(/^\/api/, ''),
          rewrite: (path2) => path2.replace(new RegExp("^" + env.VITE_APP_BASE_API), "")
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXEphdmEtUHJvamVjdHNcXFxcMVdlYkZyb250ZW5kXFxcXDZ2dWUzbWFuYWdlXFxcXDBvcmlnaW5jb2RlXFxcXHZ1ZTNfYWRtaW5fdGVtcGxhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdvcmtcXFxcSmF2YS1Qcm9qZWN0c1xcXFwxV2ViRnJvbnRlbmRcXFxcNnZ1ZTNtYW5hZ2VcXFxcMG9yaWdpbmNvZGVcXFxcdnVlM19hZG1pbl90ZW1wbGF0ZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd29yay9KYXZhLVByb2plY3RzLzFXZWJGcm9udGVuZC82dnVlM21hbmFnZS8wb3JpZ2luY29kZS92dWUzX2FkbWluX3RlbXBsYXRlL3ZpdGUuY29uZmlnLnRzXCI7Ly8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbi8vXHU1RjE1XHU1MTY1c3ZnXHU5NzAwXHU4OTgxXHU3NTI4XHU1MjMwXHU2M0QyXHU0RUY2XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJ1xyXG4vL21vY2tcdTYzRDJcdTRFRjZcdTYzRDBcdTRGOUJcdTY1QjlcdTZDRDVcclxuaW1wb3J0IHsgdml0ZU1vY2tTZXJ2ZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcclxuICAvL1x1ODNCN1x1NTNENlx1NTQwNFx1NzlDRFx1NzNBRlx1NTg4M1x1NEUwQlx1NzY4NFx1NUJGOVx1NUU5NFx1NzY4NFx1NTNEOFx1OTFDRlxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSlcclxuICByZXR1cm4ge1xyXG4gICAgLy8gcHVibGljUGF0aDogJ2h0dHBzOi8vZ2l0ZWUuY29tL2pjaDEwMTEvZ3VpZ3V6aGVueHVhbicsXHJcbiAgICAvLyBwdWJsaWNQYXRoOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgIGJhc2U6ICcvJyxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgdnVlKCksXHJcbiAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9pY29ucycpXSxcclxuICAgICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJyxcclxuICAgICAgfSksXHJcbiAgICAgIHZpdGVNb2NrU2VydmUoe1xyXG4gICAgICAgIC8vIGxvY2FsRW5hYmxlZDogY29tbWFuZCA9PT0gJ3NlcnZlJywgLy9cdTRGRERcdThCQzFcdTVGMDBcdTUzRDFcdTk2MzZcdTZCQjVcdTUzRUZcdTRFRTVcdTRGN0ZcdTc1Mjhtb2NrXHU2M0E1XHU1M0UzXHJcbiAgICAgICAgbG9jYWxFbmFibGVkOiBmYWxzZSxcclxuICAgICAgfSksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKCcuL3NyYycpLCAvLyBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdUZGMENcdTRGN0ZcdTc1MjggQCBcdTRFRTNcdTY2RkYgc3JjXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy9zY3NzXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXHU0RTAwXHU0RTJBXHU5MTREXHU3RjZFXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6ICdAaW1wb3J0IFwiLi9zcmMvc3R5bGVzL3ZhcmlhYmxlLnNjc3NcIjsnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy9cdTRFRTNcdTc0MDZcdThERThcdTU3REZcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgIFtlbnYuVklURV9BUFBfQkFTRV9BUEldOiB7XHJcbiAgICAgICAgICAvL1x1ODNCN1x1NTNENlx1NjU3MFx1NjM2RVx1NzY4NFx1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFx1OEJCRVx1N0Y2RVxyXG4gICAgICAgICAgLy8gdGFyZ2V0OiBlbnYuVklURV9TRVJWRSxcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICAgICAgICAvL1x1OTcwMFx1ODk4MVx1NEVFM1x1NzQwNlx1OERFOFx1NTdERlxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgLy9cdThERUZcdTVGODRcdTkxQ0RcdTUxOTlcclxuICAgICAgICAgIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT5cclxuICAgICAgICAgICAgcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgZW52LlZJVEVfQVBQX0JBU0VfQVBJKSwgJycpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFFakIsU0FBUyw0QkFBNEI7QUFFckMsU0FBUyxxQkFBcUI7QUFDOUIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBTTtBQUVqRCxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQ3ZDLFNBQU87QUFBQTtBQUFBO0FBQUEsSUFHTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsTUFDSixxQkFBcUI7QUFBQSxRQUNuQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUEsUUFDMUQsVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLE1BQ0QsY0FBYztBQUFBO0FBQUEsUUFFWixjQUFjO0FBQUEsTUFDaEIsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLE9BQU87QUFBQTtBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixtQkFBbUI7QUFBQSxVQUNuQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLENBQUMsSUFBSSxpQkFBaUIsR0FBRztBQUFBO0FBQUE7QUFBQSxVQUd2QixRQUFRO0FBQUE7QUFBQSxVQUVSLGNBQWM7QUFBQTtBQUFBO0FBQUEsVUFHZCxTQUFTLENBQUNBLFVBQ1JBLE1BQUssUUFBUSxJQUFJLE9BQU8sTUFBTSxJQUFJLGlCQUFpQixHQUFHLEVBQUU7QUFBQSxRQUM1RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
