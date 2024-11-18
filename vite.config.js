import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import backendUrl from './src/utils/backendurl'

// https://vitejs.dev/config/
export default defineConfig({
  	plugins: [react()],
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
