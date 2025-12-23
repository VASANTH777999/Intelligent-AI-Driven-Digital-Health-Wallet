import { useEffect, useRef } from 'react';
import './MedicalBackground.css';

const MedicalBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 30 + 10;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.3 + 0.1;
                this.type = Math.floor(Math.random() * 5);
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < -50 || this.x > canvas.width + 50 ||
                    this.y < -50 || this.y > canvas.height + 50) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;

                switch (this.type) {
                    case 0: // Heart
                        this.drawHeart();
                        break;
                    case 1: // Plus sign
                        this.drawPlus();
                        break;
                    case 2: // DNA helix
                        this.drawDNA();
                        break;
                    case 3: // Pulse line
                        this.drawPulse();
                        break;
                    case 4: // Circle (pill)
                        this.drawPill();
                        break;
                }

                ctx.restore();
            }

            drawHeart() {
                ctx.beginPath();
                const x = this.x;
                const y = this.y;
                const size = this.size / 20;

                ctx.moveTo(x, y + size * 3);
                ctx.bezierCurveTo(x, y + size * 1.5, x - size * 2.5, y - size * 1.5, x, y - size * 3);
                ctx.bezierCurveTo(x + size * 2.5, y - size * 1.5, x, y + size * 1.5, x, y + size * 3);
                ctx.stroke();
            }

            drawPlus() {
                const x = this.x;
                const y = this.y;
                const size = this.size / 2;

                ctx.beginPath();
                ctx.moveTo(x - size, y);
                ctx.lineTo(x + size, y);
                ctx.moveTo(x, y - size);
                ctx.lineTo(x, y + size);
                ctx.stroke();
            }

            drawDNA() {
                const x = this.x;
                const y = this.y;
                const size = this.size / 2;

                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const yPos = y - size + (i * size / 5);
                    const xOffset = Math.sin(i * 0.5 + time * 0.02) * size / 3;
                    ctx.arc(x + xOffset, yPos, 2, 0, Math.PI * 2);
                }
                ctx.stroke();
            }

            drawPulse() {
                const x = this.x;
                const y = this.y;
                const size = this.size / 2;

                ctx.beginPath();
                ctx.moveTo(x - size, y);
                ctx.lineTo(x - size / 2, y);
                ctx.lineTo(x - size / 4, y - size / 2);
                ctx.lineTo(x, y + size / 2);
                ctx.lineTo(x + size / 4, y);
                ctx.lineTo(x + size, y);
                ctx.stroke();
            }

            drawPill() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        for (let i = 0; i < 30; i++) {
            particles.push(new Particle());
        }

        const drawGlobe = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const globeRadius = Math.min(canvas.width, canvas.height) * 0.15;

            ctx.save();
            ctx.globalAlpha = 0.15;

            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.ellipse(centerX - globeRadius * 1.5, centerY + globeRadius * 0.3,
                globeRadius * 0.6, globeRadius * 0.8, -0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.ellipse(centerX + globeRadius * 1.5, centerY + globeRadius * 0.3,
                globeRadius * 0.6, globeRadius * 0.8, 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            ctx.save();
            ctx.globalAlpha = 0.2;

            const gradient = ctx.createRadialGradient(
                centerX - globeRadius * 0.3, centerY - globeRadius * 0.3, 0,
                centerX, centerY, globeRadius
            );
            gradient.addColorStop(0, '#14b8a6');
            gradient.addColorStop(1, '#0d9488');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                const yOffset = (i * globeRadius) / 3;
                const width = Math.sqrt(globeRadius * globeRadius - yOffset * yOffset);
                ctx.ellipse(centerX, centerY + yOffset, width, width * 0.2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            const rotation = time * 0.01;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 + rotation;
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.ellipse(0, 0, globeRadius * 0.3, globeRadius, 0, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            }

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const crossSize = globeRadius * 0.3;
            const crossThickness = crossSize * 0.3;

            ctx.fillRect(centerX - crossSize, centerY - crossThickness / 2,
                crossSize * 2, crossThickness);

            ctx.fillRect(centerX - crossThickness / 2, centerY - crossSize,
                crossThickness, crossSize * 2);

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawGlobe();

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            time++;
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="medical-background">
            <canvas ref={canvasRef} className="medical-canvas" />
            <div className="medical-overlay"></div>
        </div>
    );
};

export default MedicalBackground;
