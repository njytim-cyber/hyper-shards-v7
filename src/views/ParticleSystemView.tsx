import React, { useEffect, useRef } from 'react';

interface ParticleSystemViewProps {
    particleCount: number;
    color: [number, number, number, number]; // RGBA
}

export const ParticleSystemView: React.FC<ParticleSystemViewProps> = ({ particleCount, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const deviceRef = useRef<GPUDevice | null>(null);
    const contextRef = useRef<GPUCanvasContext | null>(null);
    const pipelineRef = useRef<GPURenderPipeline | null>(null);

    useEffect(() => {
        const initWebGPU = async () => {
            if (!navigator.gpu) {
                console.warn("WebGPU not supported on this browser.");
                return;
            }

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                console.warn("No appropriate GPUAdapter found.");
                return;
            }

            const device = await adapter.requestDevice();
            deviceRef.current = device;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext('webgpu');
            if (!context) {
                console.warn("Unable to get WebGPU context.");
                return;
            }
            contextRef.current = context;

            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device,
                format: presentationFormat,
                alphaMode: 'premultiplied',
            });

            // Basic shader for particles (just points for now)
            const shaderModule = device.createShaderModule({
                label: 'Particle Shader',
                code: `
                    @vertex
                    fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
                        // Simple triangle for testing
                        var pos = array<vec2f, 3>(
                            vec2f(0.0, 0.5),
                            vec2f(-0.5, -0.5),
                            vec2f(0.5, -0.5)
                        );
                        return vec4f(pos[vertexIndex], 0.0, 1.0);
                    }

                    @fragment
                    fn fs_main() -> @location(0) vec4f {
                        return vec4f(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
                    }
                `
            });

            const pipeline = device.createRenderPipeline({
                label: 'Particle Pipeline',
                layout: 'auto',
                vertex: {
                    module: shaderModule,
                    entryPoint: 'vs_main',
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: 'fs_main',
                    targets: [{ format: presentationFormat }],
                },
                primitive: {
                    topology: 'triangle-list',
                },
            });
            pipelineRef.current = pipeline;

            requestAnimationFrame(render);
        };

        const render = () => {
            if (!deviceRef.current || !contextRef.current || !pipelineRef.current) return;

            const encoder = deviceRef.current.createCommandEncoder({ label: 'Particle Encoder' });
            const pass = encoder.beginRenderPass({
                label: 'Particle Render Pass',
                colorAttachments: [{
                    view: contextRef.current.getCurrentTexture().createView(),
                    clearValue: [0, 0, 0, 0], // Transparent background
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            pass.setPipeline(pipelineRef.current);
            pass.draw(3); // Draw the triangle
            pass.end();

            const commandBuffer = encoder.finish();
            deviceRef.current.queue.submit([commandBuffer]);

            requestAnimationFrame(render);
        };

        initWebGPU();

        return () => {
            // Cleanup if needed
        };
    }, [color]); // Re-init if color changes (simplification)

    return <canvas ref={canvasRef} width={800} height={600} style={{ width: '100%', height: '100%' }} />;
};
