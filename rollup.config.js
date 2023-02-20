import babel from 'rollup-plugin-babel'
// import serve from 
export default {
    input: './src/index.js',
    output: {
        file: './dist/vue.js',
        name: 'Vue',
        format: "umd",
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude:'node_modules/**'
        })
    ]
}