import midtransClient from "midtrans-client/index.js"

// Create Core API instance
let coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: 'SB-Mid-server-yUbBJqhglyXT5pyU5OV58RI0',
    clientKey: 'SB-Mid-client-zOTo1GeBb0TmvZLh'
});

export default coreApi