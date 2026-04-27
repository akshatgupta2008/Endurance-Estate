import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function resolvePythonExecutable(): string {
    const fromEnv = process.env.PYTHON_PATH;
    if (fromEnv) return fromEnv;

    const candidates: string[] = [];
    if (process.platform === 'win32') {
        candidates.push(path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'));
        candidates.push(path.join(process.cwd(), '.venv', 'Scripts', 'python'));
    } else {
        candidates.push(path.join(process.cwd(), '.venv', 'bin', 'python3'));
        candidates.push(path.join(process.cwd(), '.venv', 'bin', 'python'));
    }
    candidates.push('python3');
    candidates.push('python');

    for (const candidate of candidates) {
        try {
            if (candidate === 'python' || candidate === 'python3') return candidate;
            if (fs.existsSync(candidate)) return candidate;
        } catch {
            // ignore
        }
    }

    return 'python';
}

function runPythonPrediction(pythonExe: string, scriptPath: string, features: unknown): Promise<string> {
    return new Promise((resolve, reject) => {
        const python = spawn(pythonExe, [scriptPath, JSON.stringify(features)], {
            windowsHide: true,
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8'
            }
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('error', (err) => {
            reject(err);
        });

        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr || `Python exited with code ${code}`));
                return;
            }
            resolve(stdout);
        });
    });
}

export async function POST(req: Request) {
    try {
        const body: unknown = await req.json();
        const features = (() => {
            if (typeof body !== 'object' || body === null) return undefined;

            // Support both shapes:
            // 1) { features: { ... } }
            // 2) { ...features }
            if ('features' in body) {
                return (body as Record<string, unknown>).features;
            }
            return body;
        })();

        if (!features || typeof features !== 'object') {
            return NextResponse.json(
                { error: 'Missing or invalid `features` in request body' },
                { status: 400 }
            );
        }

        const pythonScript = path.join(process.cwd(), 'src', 'python', 'predict.py');
        if (!fs.existsSync(pythonScript)) {
            return NextResponse.json(
                { error: `Prediction script not found at ${pythonScript}` },
                { status: 500 }
            );
        }

        const pythonExe = resolvePythonExecutable();
        const rawOutput = await runPythonPrediction(pythonExe, pythonScript, features);

        try {
            const predictionValue = JSON.parse(rawOutput.trim());
            return NextResponse.json({ predicted_price: predictionValue });
        } catch (e) {
            return NextResponse.json(
                {
                    error: 'Error parsing prediction output',
                    details: e instanceof Error ? e.message : String(e),
                    rawOutput
                },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to run prediction' },
            { status: 500 }
        );
    }
}