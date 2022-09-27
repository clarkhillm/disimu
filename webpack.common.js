const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, './index.html')
        })
    ],
    externals: {
        jquery: "jQuery"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            }
                        }
                    }
                ]

            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.less$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|bmp|jpeg)$/,
                use: ["file-loader"]
            },
            {
                test: /\.js|jsx|pem$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": ["@babel/preset-env"]
                    }
                },
                exclude: /node_modules/,

            },
        ]
    }
};
