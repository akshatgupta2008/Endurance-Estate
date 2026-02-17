import { NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from 'path';
// import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req: Request, res: Response): Promise<void> {
    console.log("Request body:", req.body);
    console.log("Hello ");



    try {
        const { features } = await req.json();
        console.log("Features:", features);
        // Run Python script to make prediction
        const pythonScript = path.join(process.cwd(), 'python', 'predict.py');
        const python = spawn('python', [pythonScript, JSON.stringify(features)]);

        let prediction = '';
        let errors = '';

        // Collect data from script
        python.stdout.on('data', (data) => {
            prediction += data.toString();
        });

        python.stderr.on('data', (data) => {
            errors += data.toString();
        });

        // When the script closes
        return new Promise<void>((resolve) => {
            python.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python script exited with code ${code}`);
                    console.error(errors);
                    res.status(500).json({ error: 'Error executing prediction script' });
                } else {
                    try {
                        const predictionValue = JSON.parse(prediction.trim());
                        res.status(200).json({ prediction: predictionValue });
                    } catch (e) {
                        console.error('Error parsing prediction output:', e);
                        res.status(500).json({ error: 'Error parsing prediction output' });
                    }
                }
                resolve();
            });
        });
        // const { text } = await req.json();
        // const apiKey = process.env.GEMINI_API_KEY;
        // const genAI = new GoogleGenerativeAI(apiKey);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // const result = await model.generateContent(text);

        return NextResponse.json({ 'prediction': 1000000 });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to get response from gemini" }, { status: 500 });
    }
}