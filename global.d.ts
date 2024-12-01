declare namespace NodeJS {
    interface ProcessEnv {
        MONGO_URI: string; // Define all expected environment variables here
    }
}

// declare global {
//     namespace Express{
//         interface Request{
//             user?: any
//         }
//     }
// }