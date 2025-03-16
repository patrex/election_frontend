import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import backendUrl from './src/utils/backendurl'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import polyfillNode from 'rollup-plugin-polyfill-node'




// https://vitejs.dev/config/
export default defineConfig({
  	plugins: [react()],
	// build: {
	// 	rollupOptions: {
	// 		plugins: [
	// 			resolve(),
	// 			commonjs(),
	// 			peerDepsExternal(),
	// 			polyfillNode()
	// 		]
	// 	}
	// },
  	resolve: {
		alias: {
	  		"@": path.resolve(__dirname, "./src"),
		},
      	},
  	server: {
		proxy: {
			'/elections': {
				target: `${backendUrl}`,
				secure: false,
			},
			'/election': {
				target: `${backendUrl}`,
				secure: false,
			},
			'/user': {
				target: `${backendUrl}`,
				secure: false,
			},
		}
  	},
})
