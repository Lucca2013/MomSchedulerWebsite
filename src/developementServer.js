import app from "./app/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server at http://localhost:${PORT}`);
});