addListeners();

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, { x: 100, y: 10 });
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    document.getElementById('fadeOut')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().fadeOut(block, 5000);
        });

    const moveAndHideBlock = document.getElementById('moveAndHideBlock');
    let moveAndHidePlayer = null;

    document.getElementById('moveAndHide')
        .addEventListener('click', function () {
            moveAndHidePlayer = animaster().moveAndHide(moveAndHideBlock, 5000);
        });

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHidePlayer) {
                moveAndHidePlayer.reset();
            }
        });

    document.getElementById('showAndHide')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 1000);
        });

    const heartBeatingBlock = document.getElementById('heartBeatingBlock');
    let heartBeatingPlayer = null;

    document.getElementById('heartBeating')
        .addEventListener('click', function () {
            if (heartBeatingPlayer) {
                heartBeatingPlayer.stop();
            }
            heartBeatingPlayer = animaster().heartBeating(heartBeatingBlock, 1000, 1);
        });

    document.getElementById('stopHeartBeating')
        .addEventListener('click', function () {
            if (heartBeatingPlayer) {
                heartBeatingPlayer.stop();
            }
        });
}

function animaster() {
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.add('hide');
        element.classList.remove('show');
    }

    function move(element, duration, translation, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        const transform = getTransform(translation, ratio);
        element.style.transform = transform || null;
    }

    function scale(element, duration, ratio, translation) {
        element.style.transitionDuration = `${duration}ms`;
        const transform = getTransform(translation, ratio);
        element.style.transform = transform || null;
    }

    function resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.add('hide');
        element.classList.remove('show');
    }

    function resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    function cloneStep(step) {
        return {
            ...step,
            translation: step.translation ? { ...step.translation } : undefined
        };
    }

    function saveInitialState(element) {
        return {
            hasHideClass: element.classList.contains('hide'),
            hasShowClass: element.classList.contains('show'),
            transform: element.style.transform,
            transitionDuration: element.style.transitionDuration
        };
    }

    function resetToInitialState(element, state) {
        resetMoveAndScale(element);

        if (state.hasHideClass) {
            resetFadeIn(element);
        } else if (state.hasShowClass) {
            resetFadeOut(element);
        } else {
            element.classList.remove('hide');
            element.classList.remove('show');
        }

        if (state.hasHideClass && state.hasShowClass) {
            element.classList.add('show');
        }

        element.style.transform = state.transform || null;
        element.style.transitionDuration = state.transitionDuration || null;
    }

    return {
        _steps: [],
        fadeIn(element, duration) {
            return animaster()
                .addFadeIn(duration)
                .play(element);
        },
        move(element, duration, translation) {
            return animaster()
                .addMove(duration, translation)
                .play(element);
        },
        scale(element, duration, ratio) {
            return animaster()
                .addScale(duration, ratio)
                .play(element);
        },
        fadeOut(element, duration) {
            return animaster()
                .addFadeOut(duration)
                .play(element);
        },
        moveAndHide(element, duration, translation = { x: 100, y: 20 }) {
            return animaster()
                .addMove(duration * 2 / 5, translation)
                .addFadeOut(duration * 3 / 5)
                .play(element);
        },
        showAndHide(element, duration) {
            return animaster()
                .addFadeIn(duration / 3)
                .addDelay(duration / 3)
                .addFadeOut(duration / 3)
                .play(element);
        },
        addMove(duration, translation) {
            this._steps.push({ type: 'move', duration, translation });
            return this;
        },
        addScale(duration, ratio) {
            this._steps.push({ type: 'scale', duration, ratio });
            return this;
        },
        addFadeIn(duration) {
            this._steps.push({ type: 'fadeIn', duration });
            return this;
        },
        addFadeOut(duration) {
            this._steps.push({ type: 'fadeOut', duration });
            return this;
        },
        addDelay(duration) {
            this._steps.push({ type: 'delay', duration });
            return this;
        },
        play(element, cycled = false) {
            const steps = this._steps.map(cloneStep);
            const initialState = saveInitialState(element);
            const transformState = {
                translation: null,
                ratio: null
            };

            let isStopped = false;
            let timeoutId = null;

            const stopAnimation = function () {
                isStopped = true;
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            };

            const resetAnimation = function () {
                stopAnimation();
                resetToInitialState(element, initialState);
            };

            const runStep = (index) => {
                if (isStopped || steps.length === 0) {
                    return;
                }

                const step = steps[index];
                const duration = typeof step.duration === 'number' ? step.duration : 0;

                if (step.type === 'move') {
                    transformState.translation = step.translation;
                    move(element, duration, transformState.translation, transformState.ratio);
                }

                if (step.type === 'scale') {
                    transformState.ratio = step.ratio;
                    scale(element, duration, transformState.ratio, transformState.translation);
                }

                if (step.type === 'fadeIn') {
                    fadeIn(element, duration);
                }

                if (step.type === 'fadeOut') {
                    fadeOut(element, duration);
                }

                timeoutId = setTimeout(() => {
                    if (isStopped) {
                        return;
                    }

                    if (index + 1 < steps.length) {
                        runStep(index + 1);
                        return;
                    }

                    if (cycled) {
                        runStep(0);
                    }
                }, duration);
            };

            if (steps.length > 0) {
                runStep(0);
            }

            return {
                stop: stopAnimation,
                reset: resetAnimation
            };
        },
        heartBeating(element, duration, ratio = 1) {
            return animaster()
                .addScale(duration / 2, ratio * 1.4)
                .addScale(duration / 2, ratio)
                .play(element, true);
        },
        buildHandler(cycled = false) {
            const animation = this;
            return function () {
                return animation.play(this, cycled);
            };
        }
    };
}

function getTransform(translation, ratio) {
    const result = [];

    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }

    if (typeof ratio === 'number' && ratio !== 1) {
        result.push(`scale(${ratio})`);
    }

    return result.join(' ');
}
