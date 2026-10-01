import app from "./app.js";

try {
    app.listen(5000, ()=>{
        console.log(`Backend is listening at Port: ${5000}`)
    })    
} catch (error) {
    console.error(`The process failed with some error: ${error}`)
}
