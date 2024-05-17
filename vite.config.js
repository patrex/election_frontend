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
				target: 'https://election-backend-kduj.onrender.com',
				secure: true
			},
			
			'/election': {
				target: 'https://election-backend-kduj.onrender.com',
				secure: true
			},
			'/user': {
				target: 'https://election-backend-kduj.onrender.com',
				secure: true
			},
		}
  	},
})
