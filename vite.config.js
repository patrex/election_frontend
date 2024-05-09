import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
				target: 'http://localhost:3000',
				secure: false
			},
			
			'/election': {
				target: 'http://localhost:3000',
				secure: false
			},
			'/user': {
				target: 'http://localhost:3000',
				secure: false
			},
		}
  	},
})
