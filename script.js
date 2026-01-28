import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const nav = document.querySelector("nav");
    const header = document.querySelector(".header");
    const heroImg = document.querySelector(".quote-card");
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");

    const setCanvasSize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        context.scale(pixelRatio, pixelRatio);
    };

    setCanvasSize();

    const frameCount = 240;
    const currentFrame = (index) =>
        `https://ik.imagekit.io/vlries1el/trebound/frame%20dubai/frame_${(index + 9000000000).toString()}.jpg`;

    let image = [];
    let videoFrames = { frame: 0 };
    let imagesToLoad = frameCount;

    const onLoad = () => {
        imagesToLoad--;

        if(!imagesToLoad) {
            render();
            setupScrollTrigger();
        }
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = function () {
            onLoad.call(this);
        };
        img.src = currentFrame(i);
        image.push(img);
    }

    const render = () => {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const img = image[videoFrames.frame];
        if (img && img.complete && img.naturalWidth > 0) {
            const imageAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, drawX, drawY;

            if (imageAspect > canvasAspect) {
                drawHeight = canvasHeight;
                drawWidth = drawHeight * imageAspect;
                drawX = (canvasWidth - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = canvasWidth;
                drawHeight = drawWidth / imageAspect;
                drawX = 0;
                drawY = (canvasHeight - drawHeight) / 2;
            }

            context.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        }

        
    };

    const setupScrollTrigger = () => {
        ScrollTrigger.create({
            trigger: ".hero",
            start: "top top",
            end: `+=${frameCount * 10}px`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                const animationProgress = Math.min(progress / 0.9, 1);
                const targetFrame = Math.round(animationProgress * (frameCount - 1));
                videoFrames.frame = targetFrame;
                render();

                if (progress <= 0.1) {
                    const navProgress = progress / 0.1;
                    const opacity = 1 - navProgress;
                    gsap.set(nav, { opacity });
                } else {
                    gsap.set(nav, { opacity: 0 });    
                }

                if (progress <= 0.25) {
                    const zProgress = progress / 0.25;
                    const translateZ = zProgress * -500;

                    let opacity = 1;
                    if (progress >= 0.2) {
                        const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
                        opacity = 1 - fadeProgress;
                    }

                    gsap.set(header, { opacity });
                } else {
                    gsap.set(header, { opacity: 0 });
                }

                if (progress < 0.6) {
                    gsap.set(heroImg, {
                        transform: "translate(-50%, -50%) translateZ(-1000px)",
                        opacity: 0,
                    });
                } else if (progress >= 0.6 && progress <= 0.9) {
                    const imgProgress = (progress - 0.6) / 0.3;
                    const translateZ = -1000 + (imgProgress * 1000); // Goes from -1000 to 0

                    let opacity = 0;
                    if (progress <= 0.8) {
                        const opacityProgress = (progress - 0.6) / 0.2;
                        opacity = opacityProgress;
                    } else {
                        opacity = 1;
                    }

                    gsap.set(heroImg, {
                        transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
                        opacity,
                    });
                } else {
                    gsap.set(heroImg, {
                        transform: "translate(-50%, -50%) translateZ(0px)",
                        opacity: 1,
                    });
                }

                // Stats Section Animation Logic (Appears 20%-60%)
                const statsSection = document.querySelector(".stats-section");
                if (statsSection) {
                    if (progress < 0.2) {
                        gsap.set(statsSection, {
                            transform: "translate(-50%, -50%) translateZ(-1000px)",
                            opacity: 0
                        });
                    } else if (progress >= 0.2 && progress < 0.3) {
                         // Fade In & Move Forward
                        const statsProgress = (progress - 0.2) / 0.1;
                        const translateZ = -1000 + (statsProgress * 1000); // -1000 to 0
                        
                        gsap.set(statsSection, {
                            transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
                            opacity: statsProgress
                        });
                    } else if (progress >= 0.3 && progress <= 0.5) {
                         // Stay Visible
                        gsap.set(statsSection, {
                            transform: "translate(-50%, -50%) translateZ(0px)",
                            opacity: 1
                        });
                    } else if (progress > 0.5 && progress < 0.6) {
                         // Fade Out
                        const fadeOutProgress = (progress - 0.5) / 0.1;
                        const opacity = 1 - fadeOutProgress;
                        
                        gsap.set(statsSection, {
                             transform: "translate(-50%, -50%) translateZ(0px)",
                             opacity: opacity
                        });
                    } else {
                        // Hidden
                        gsap.set(statsSection, {
                            transform: "translate(-50%, -50%) translateZ(-1000px)",
                            opacity: 0
                        });
                    }
                }


                // Tooltip Animation Logic (Appears BEFORE hero, fades out as hero fades in)
                const tooltipsContent = document.querySelector(".tooltips-content");
                if (tooltipsContent) {
                    if (progress < 0.2) {
                        // Hidden before 20%
                        gsap.set(tooltipsContent, {
                            opacity: 0,
                        });
                    } else if (progress >= 0.2 && progress < 0.5) {
                        // Fade in from 20% to 50%
                        const fadeInProgress = (progress - 0.2) / 0.3;
                        gsap.set(tooltipsContent, {
                            opacity: fadeInProgress,
                        });
                    } else if (progress >= 0.5 && progress < 0.8) {
                        // Fade out from 50% to 80% (as hero fades in from 60% to 80%)
                        const fadeOutProgress = (progress - 0.5) / 0.3;
                        gsap.set(tooltipsContent, {
                            opacity: 1 - fadeOutProgress,
                        });
                    } else {
                        // Fully hidden after 80%
                        gsap.set(tooltipsContent, {
                            opacity: 0,
                        });
                    }
                }
            
            },
        });

        window.addEventListener("resize", () => {
            setCanvasSize();
            render();
            ScrollTrigger.refresh();
        });

        // Marquee horizontal scroll - initialized AFTER hero section setup
        const marqueeImages = document.querySelector(".marquee-images");
        
        if (marqueeImages) {
            const getScrollAmount = () => {
                const marqueeWidth = marqueeImages.scrollWidth;
                const viewportWidth = window.innerWidth;
                return -(marqueeWidth - viewportWidth);
            };

            ScrollTrigger.create({
                trigger: ".marquee",
                start: "top top",
                end: "+=2000", /* Scroll distance for animation duration */
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    
                    // Start from -50% (CSS initial) and move to full getScrollAmount
                    const scrollProgress = progress;
                    const initialOffset = -window.innerWidth * 0.5; // -50% of viewport
                    const totalScroll = getScrollAmount() - initialOffset;
                    const scrollDistance = initialOffset + (totalScroll * scrollProgress);
                    
                    gsap.set(marqueeImages, {
                        x: scrollDistance
                    });
                },
            });
        }

        // Horizontal Scroll Section Animation
        const horizontalSections = document.querySelectorAll(".horizontal-scroll");
        horizontalSections.forEach((horizontalSection) => {
            const horizontalWrapper = horizontalSection.querySelector(".horizontal-scroll-wrapper");

            if (horizontalWrapper) {
                const getScrollAmount = () => {
                    return -(horizontalWrapper.scrollWidth - window.innerWidth);
                };

                gsap.to(horizontalWrapper, {
                    x: getScrollAmount,
                    ease: "none",
                    scrollTrigger: {
                        trigger: horizontalSection,
                        start: "top top",
                        end: () => `+=${horizontalWrapper.scrollWidth - window.innerWidth}`,
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    },
                });
            }
        });

        // FAQ Toggle Logic
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const card = question.parentElement;
                // Optional: Close others
                // document.querySelectorAll('.faq-card').forEach(c => {
                //     if (c !== card) c.classList.remove('active');
                // });
                card.classList.toggle('active');
            });
        });
    };
});