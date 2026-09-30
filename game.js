/* ==========================================================================
   SUPER BIRA - RETRO-BOTECO GAME ENGINE
   ========================================================================== */

// Global Game State
let game;

// ==========================================================================
// 1. SYSTEM AUDIO (WEB AUDIO API RETRO SYNTHESIS)
// ==========================================================================
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.bgmInterval = null;
        this.bgmStep = 0;
        this.tempo = 135; // Fast samba tempo
        this.notes = [
            // Samba melodic progression (A-minor key, bossa feel)
            440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00
        ];
        
        // Simple samba chord progression (bass notes in Hz)
        this.bassNotes = [
            110.00, 110.00, 130.81, 130.81, // Am, C
            146.83, 146.83, 164.81, 164.81, // Dm, E
            110.00, 110.00, 130.81, 130.81, 
            196.00, 196.00, 164.81, 164.81  // G, E
        ];
        
        this.melodyPattern = [
            4, -1, 4, 5, 6, -1, 5, -1, 
            3, 3, -1, 4, 3, 2, -1, -1,
            2, -1, 2, 3, 4, -1, 3, -1,
            1, 2, 1, 0, -1, -1, -1, -1
        ];
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.startBGM();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play synthesized sound effects
    playJump() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        
        // Quick upward frequency sweep
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playThrow() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        
        // Fast downward sweep like a throw/whiz
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const noise = this.ctx.createOscillator(); // Simple noise approximation
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.3);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playDrink() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();

        // Play bubble / gulp sounds
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + i * 150, now + delay);
            osc.frequency.exponentialRampToValueAtTime(800 + i * 150, now + delay + 0.06);
            
            gain.gain.setValueAtTime(0.1, now + delay);
            gain.gain.linearRampToValueAtTime(0.01, now + delay + 0.06);
            
            osc.start(now + delay);
            osc.stop(now + delay + 0.06);
        }
    }

    playCoxinha() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();

        // Happy healing chime
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0.12, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.05 + 0.25);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.25);
        });
    }

    playVictory() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.stopBGM();
        this.resume();

        const now = this.ctx.currentTime;
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1318.51, 1567.98, 2093.00];
        melody.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.15, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.4);
        });
        
        setTimeout(() => this.startBGM(), 3000);
    }

    playGameOver() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.stopBGM();
        this.resume();

        const now = this.ctx.currentTime;
        const melody = [392.00, 349.23, 311.13, 261.63, 196.00]; // Sad descending chords
        melody.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            gain.gain.setValueAtTime(0.15, now + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.15 + 0.5);
            
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.5);
        });
        
        setTimeout(() => this.startBGM(), 4000);
    }

    playRanDanDan() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        // Staccato rev cuts (RAN-DAN-DAN!)
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140 + Math.random() * 80, now + i * 0.04);
            gain.gain.setValueAtTime(0.18, now + i * 0.04);
            gain.gain.linearRampToValueAtTime(0.01, now + i * 0.04 + 0.035);
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.035);
        }
    }

    playBossHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playMapMove() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    startBGM() {
        if (!this.musicEnabled || !this.ctx || this.bgmInterval) return;
        
        const stepTime = 60 / this.tempo / 2; // 8th notes
        
        this.bgmInterval = setInterval(() => {
            this.resume();
            if (this.ctx.state === 'suspended') return;
            
            const now = this.ctx.currentTime;
            
            // 1. BEAT: Kick drum pulse on beat 1 and 3 (every 4 steps)
            if (this.bgmStep % 4 === 0) {
                const kick = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kick.connect(kickGain);
                kickGain.connect(this.ctx.destination);
                kick.type = 'triangle';
                kick.frequency.setValueAtTime(100, now);
                kick.frequency.exponentialRampToValueAtTime(40, now + 0.08);
                kickGain.gain.setValueAtTime(0.25, now);
                kickGain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                kick.start(now);
                kick.stop(now + 0.08);
            }
            
            // 2. BEAT: Hat shake ("chique-chique" rhythm) on steps 2 and 4
            if (this.bgmStep % 2 === 1) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(8000 + Math.random() * 2000, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            }
            
            // 3. BASS: Samba syncopated bass line
            if (this.bgmStep % 4 === 0 || this.bgmStep % 4 === 3) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.connect(bassGain);
                bassGain.connect(this.ctx.destination);
                bassOsc.type = 'sine';
                
                const chordIdx = Math.floor(this.bgmStep / 4) % this.bassNotes.length;
                let bassFreq = this.bassNotes[chordIdx];
                if (this.bgmStep % 4 === 3) bassFreq *= 1.5; // Syncopated jump
                
                bassOsc.frequency.setValueAtTime(bassFreq, now);
                bassGain.gain.setValueAtTime(0.18, now);
                bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                
                bassOsc.start(now);
                bassOsc.stop(now + 0.18);
            }

            // 4. MELODY: Lead synth playing Bossa/Samba riff
            const melodyIdx = this.bgmStep % this.melodyPattern.length;
            const noteVal = this.melodyPattern[melodyIdx];
            if (noteVal !== -1) {
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                leadOsc.connect(leadGain);
                leadGain.connect(this.ctx.destination);
                
                leadOsc.type = 'triangle';
                const baseNote = this.notes[noteVal];
                
                // Slightly vibrato/detuned for retro charm
                leadOsc.frequency.setValueAtTime(baseNote, now);
                
                leadGain.gain.setValueAtTime(0.06, now);
                leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
                
                leadOsc.start(now);
                leadOsc.stop(now + 0.22);
            }
            
            this.bgmStep = (this.bgmStep + 1) % 64; // Loop progression
        }, stepTime * 1000);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.init();
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.musicEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
}

// ==========================================================================
// 2. PARTICLE SYSTEM (VISUAL EFFECTS)
// ==========================================================================
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'beer', 'dust', 'star', 'confetti'
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.03;
        this.color = '#fff';
        this.size = 2 + Math.random() * 4;
        
        if (type === 'beer') {
            this.color = Math.random() > 0.4 ? '#ffd700' : '#ffffff'; // beer / foam
            this.vy = -1 - Math.random() * 3;
            this.size = 3 + Math.random() * 3;
        } else if (type === 'dust') {
            this.color = 'rgba(200, 200, 200, 0.4)';
            this.vy = -0.5 - Math.random();
            this.size = 4 + Math.random() * 6;
        } else if (type === 'star') {
            this.color = '#ffeb3b';
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = -3 - Math.random() * 4;
            this.size = 5 + Math.random() * 5;
        } else if (type === 'confetti') {
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', '#ffeb3b', '#ff9800'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = -5 - Math.random() * 5;
            this.size = 4 + Math.random() * 4;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'beer' || this.type === 'star' || this.type === 'confetti') {
            this.vy += 0.15; // Gravity on particles
        }
        
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        
        if (this.type === 'star') {
            // Draw cute 4-point star
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size/2, this.y - this.size/2);
            ctx.lineTo(this.x + this.size, this.y);
            ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
            ctx.lineTo(this.x, this.y + this.size);
            ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
            ctx.lineTo(this.x - this.size, this.y);
            ctx.lineTo(this.x - this.size/2, this.y - this.size/2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// ==========================================================================
// 3. PROJECTILE (BIRA'S FLIP-FLOP / CHINELO)
// ==========================================================================
class Projectile {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 12;
        this.vx = dir * 9;
        this.vy = -3;
        this.angle = 0;
        this.spinSpeed = 0.25 * dir;
        this.isReturning = false;
        this.owner = null;
        this.hitCount = 0;
        this.maxDistance = 250;
        this.startX = x;
    }

    update(player) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spinSpeed;
        
        // Physics logic: Flip-flop is acts like a boomerang!
        const dist = Math.abs(this.x - this.startX);
        
        if (!this.isReturning && dist > this.maxDistance) {
            this.isReturning = true;
        }
        
        if (this.isReturning) {
            // Actively pull towards Bira
            const dx = player.x + player.width / 2 - this.x;
            const dy = player.y + player.height / 2 - this.y;
            const distToPlayer = Math.sqrt(dx * dx + dy * dy);
            
            if (distToPlayer > 10) {
                this.vx = (dx / distToPlayer) * 8;
                this.vy = (dy / distToPlayer) * 8;
            } else {
                // Caught! Give ammunition back
                player.ammo = Math.min(player.maxAmmo, player.ammo + 1);
                game.sounds.playDrink(); // Play a nice catch sound
                return true; // Mark for deletion
            }
        } else {
            this.vy += 0.08; // Small gravity sweep
        }
        
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw Flip-Flop (Havaianas Red Chinelo)
        ctx.shadowColor = 'rgba(255, 51, 102, 0.4)';
        ctx.shadowBlur = 6;
        
        // Sole
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // White Strap ("Y" shape)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-this.width / 4, 0);
        ctx.lineTo(this.width / 4, -this.height / 3);
        ctx.moveTo(-this.width / 4, 0);
        ctx.lineTo(this.width / 4, this.height / 3);
        ctx.stroke();
        
        ctx.restore();
    }
}

// ==========================================================================
// 4. COLLECTIBLE ITEMS (BEER, COROTE, COXINHA, CHINELO)
// ==========================================================================
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.type = type; // 'cerveja', 'corote', 'coxinha', 'chinelo'
        this.floatOffset = Math.random() * 100;
        this.pulse = 0;
    }

    update() {
        this.floatOffset += 0.05;
        this.pulse = Math.sin(this.floatOffset) * 4;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.pulse);
        
        ctx.shadowBlur = 8;
        
        if (this.type === 'cerveja') {
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            // Draw brown bottle
            ctx.fillStyle = '#8b5a2b'; // brown bottle
            ctx.beginPath();
            ctx.rect(-6, -6, 12, 18); // body
            ctx.rect(-3, -14, 6, 8);  // neck
            ctx.fill();
            // Label
            ctx.fillStyle = '#ffd700'; // gold label
            ctx.fillRect(-5, -2, 10, 8);
            // Cap
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-4, -16, 8, 2);
        } else if (this.type === 'corote') {
            ctx.shadowColor = 'rgba(0, 255, 255, 0.6)';
            // Blue plastic corote bottle
            ctx.fillStyle = '#00bcd4';
            ctx.beginPath();
            ctx.rect(-8, -4, 16, 14); // body
            ctx.arc(0, -4, 8, Math.PI, 0); // round shoulder
            ctx.rect(-3, -12, 6, 4); // neck
            ctx.fill();
            // Cap
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(-4, -14, 8, 2);
            // Label
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-6, -1, 12, 6);
        } else if (this.type === 'coxinha') {
            ctx.shadowColor = 'rgba(255, 102, 0, 0.6)';
            // Golden tear-drop coxinha
            ctx.fillStyle = '#ff9800'; // orange-gold crust
            ctx.beginPath();
            ctx.moveTo(0, -12); // point
            ctx.quadraticCurveTo(10, 4, 8, 10);
            ctx.quadraticCurveTo(0, 14, -8, 10);
            ctx.quadraticCurveTo(-10, 4, 0, -12);
            ctx.closePath();
            ctx.fill();
            // Crispy details
            ctx.fillStyle = '#e65100';
            ctx.fillRect(-2, 0, 4, 2);
            ctx.fillRect(3, 4, 2, 2);
        } else if (this.type === 'chinelo') {
            ctx.shadowColor = 'rgba(0, 255, 255, 0.6)';
            // Floating red flip-flop ammo pack
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 6, Math.PI/4, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(4, 4);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// ==========================================================================
// 5. ENEMIES (CARAMELO, MENDIGO, DONO DE BAR)
// ==========================================================================
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'caramelo', 'mendigo', 'dono_bar'
        this.vx = -1.5;
        this.vy = 0;
        this.width = 40;
        this.height = 40;
        this.health = 1;
        this.isGrounded = false;
        
        this.patrolRange = 200;
        this.startX = x;
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Attack/Behavior properties
        this.throwTimer = 0;
        
        if (type === 'caramelo') {
            this.width = 46;
            this.height = 30;
            this.vx = -2.5; // Fast dog!
            this.health = 1;
        } else if (type === 'mendigo') {
            this.width = 40;
            this.height = 50;
            this.vx = -0.5; // Crawls or sits
            this.health = 2;
        } else if (type === 'noiado') {
            this.width = 36;
            this.height = 48;
            this.vx = -2.8; // Quick darting street dealer
            this.health = 1;
            this.patrolRange = 220;
        } else if (type === 'motoqueiro') {
            this.width = 64;
            this.height = 44;
            this.vx = -4.6; // High speed motorcycle giving grau!
            this.health = 2;
            this.patrolRange = 700;
            this.ranDanTimer = 0;
        } else if (type === 'dona_fila') {
            this.width = 52;
            this.height = 68;
            this.vx = -2.2; // Boss of Mercadinho Talismã
            this.health = 5;
            this.maxHealth = 5;
            this.isBoss = true;
            this.patrolRange = 360;
            this.enraged = false;
        } else if (type === 'dono_bar') {
            this.width = 44;
            this.height = 60;
            this.vx = -2.0; // Angry walk
            this.health = 3; // Tough tank
        }
    }

    update(platforms, player) {
        // Apply Gravity
        this.vy += 0.5;
        
        // Handle Horizontal patrol movement
        this.x += this.vx;
        
        // Boundaries checks / reversal
        if (Math.abs(this.x - this.startX) > this.patrolRange) {
            this.vx *= -1;
            this.x = this.x < this.startX ? this.startX - this.patrolRange : this.startX + this.patrolRange;
        }
        
        // Handle Gravity & Platform Collisions
        this.isGrounded = false;
        platforms.forEach(plat => {
            if (this.x + this.width > plat.x && this.x < plat.x + plat.width) {
                // Standing on top check
                if (this.y + this.height <= plat.y && this.y + this.height + this.vy >= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                }
            }
        });
        
        this.y += this.vy;
        
        // Keep inside canvas bounds vertically
        if (this.y > 480) {
            this.health = 0; // Fell in hole!
        }
        
        // Behavior mechanics
        this.throwTimer++;
        if (this.type === 'mendigo') {
            // Throw cans at player occasionally if in range
            const dist = Math.abs(player.x - this.x);
            if (dist < 320 && this.throwTimer > 140) {
                this.throwTimer = 0;
                game.spawnEnemyProjectile(this.x, this.y, player.x < this.x ? -1 : 1, 'can');
            }
        } else if (this.type === 'noiado') {
            // Jumpy and throws smoke puff
            const dist = Math.abs(player.x - this.x);
            if (dist < 280 && this.throwTimer > 120) {
                this.throwTimer = 0;
                game.spawnEnemyProjectile(this.x, this.y, player.x < this.x ? -1 : 1, 'smoke');
            }
            if (this.isGrounded && Math.random() < 0.02) {
                this.vy = -6.5;
            }
        } else if (this.type === 'motoqueiro') {
            // Cortando o giro: noise and smoke
            this.ranDanTimer++;
            if (this.ranDanTimer % 45 === 0) {
                game.sounds.playRanDanDan();
                for (let i = 0; i < 3; i++) {
                    game.particles.push(new Particle(this.x + (this.vx < 0 ? this.width : 0), this.y + this.height - 8, 'dust'));
                }
            }
        } else if (this.type === 'dona_fila') {
            // Boss AI: Throws "A Conta do Fiado" & Enrages
            if (this.health <= 2 && !this.enraged) {
                this.enraged = true;
                this.vx = (this.vx < 0 ? -3.4 : 3.4);
                game.triggerScreenShake(12);
                game.sounds.playBossHit();
            }
            const throwRate = this.enraged ? 75 : 120;
            const dist = Math.abs(player.x - this.x);
            if (dist < 480 && this.throwTimer > throwRate) {
                this.throwTimer = 0;
                game.spawnEnemyProjectile(this.x, this.y - 12, player.x < this.x ? -1 : 1, 'conta');
            }
            if (this.isGrounded && Math.random() < (this.enraged ? 0.035 : 0.015)) {
                this.vy = this.enraged ? -9.5 : -7.0;
                if (this.enraged) game.triggerScreenShake(5);
            }
        } else if (this.type === 'dono_bar') {
            // Charge at player if close
            const dist = Math.abs(player.x - this.x);
            if (dist < 200) {
                this.vx = (player.x < this.x ? -3.5 : 3.5);
            } else {
                this.vx = this.vx < 0 ? -1.8 : 1.8;
            }
        } else if (this.type === 'caramelo') {
            // Randomly jump over obstacles
            if (this.isGrounded && Math.random() < 0.018) {
                this.vy = -7.5;
            }
        }
        
        // Animation
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Mirror drawing based on velocity direction
        const dir = this.vx < 0 ? -1 : 1;
        ctx.scale(dir, 1);
        
        if (this.type === 'caramelo') {
            // ----------------------------------------------------
            // DRAW VIRA-LATA CARAMELO
            // ----------------------------------------------------
            ctx.fillStyle = '#d89b34'; // Caramel body color
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(216,155,52,0.4)';
            
            // Torso
            ctx.fillRect(-18, -6, 28, 14);
            
            // Legs (animated)
            ctx.fillStyle = '#b77d1e';
            const legSwing = Math.sin(this.animFrame * (Math.PI / 2)) * 6;
            ctx.fillRect(-14, 8, 5, 8 + (dir * legSwing > 0 ? 0 : -3));
            ctx.fillRect(4, 8, 5, 8 + (dir * legSwing < 0 ? 0 : -3));
            ctx.fillStyle = '#d89b34';
            ctx.fillRect(-6, 8, 5, 8 + (dir * legSwing < 0 ? 0 : -3));
            ctx.fillRect(10, 8, 5, 8 + (dir * legSwing > 0 ? 0 : -3));
            
            // Neck & Head
            ctx.beginPath();
            ctx.moveTo(6, -6);
            ctx.lineTo(16, -18);
            ctx.lineTo(26, -18);
            ctx.lineTo(24, -2);
            ctx.lineTo(10, 8);
            ctx.closePath();
            ctx.fill();
            
            // Snout/Mouth
            ctx.fillStyle = '#ffeed0';
            ctx.fillRect(18, -14, 10, 7);
            ctx.fillStyle = '#000000';
            ctx.fillRect(26, -14, 3, 3); // Nose
            
            // Floppy Ear
            ctx.fillStyle = '#8f5c09';
            ctx.fillRect(10, -22, 6, 10);
            
            // Wagging Tail
            ctx.save();
            const tailWag = Math.sin(Date.now() / 80) * 15;
            ctx.translate(-18, -4);
            ctx.rotate(tailWag * Math.PI / 180 - Math.PI / 6);
            ctx.fillStyle = '#d89b34';
            ctx.fillRect(-10, -3, 10, 6);
            ctx.restore();
            
        } else if (this.type === 'mendigo') {
            // ----------------------------------------------------
            // DRAW MENDIGO
            // ----------------------------------------------------
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            
            // Green Ragged Overcoat
            ctx.fillStyle = '#3e4a3c';
            ctx.fillRect(-15, -10, 30, 35);
            // Patch on coat
            ctx.fillStyle = '#a66249';
            ctx.fillRect(2, 4, 8, 6);
            
            // Legs (worn jeans)
            ctx.fillStyle = '#424c5b';
            ctx.fillRect(-12, 25, 10, 10);
            ctx.fillRect(2, 25, 10, 10);
            
            // Head with fuzzy grey beard
            ctx.fillStyle = '#dfc4a5'; // face
            ctx.beginPath();
            ctx.arc(0, -18, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Beard & Hair
            ctx.fillStyle = '#9e9e9e';
            ctx.beginPath();
            ctx.arc(0, -14, 9, 0, Math.PI); // beard
            ctx.fill();
            ctx.fillRect(-12, -24, 24, 7); // messy hair
            
            // Ragged brown beanie
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-8, -26, 16, 6);
            
            // Sits next to cardboard box
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(-22, 5, 8, 20);
            
        } else if (this.type === 'noiado') {
            // ----------------------------------------------------
            // DRAW NOIADO / VENDEDOR SUSPEITO DO BECO
            // ----------------------------------------------------
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            
            // Black oversized tank top
            ctx.fillStyle = '#1a1a24';
            ctx.fillRect(-12, -6, 24, 24);
            // Gold chain on chest
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-3, -2, 6, 2);
            
            // Baggy Tactel Bermuda (Cyclone style striped)
            ctx.fillStyle = '#0288d1';
            ctx.fillRect(-14, 18, 28, 12);
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(-14, 22, 28, 2);
            
            // Skinny legs
            ctx.fillStyle = '#c59b7b';
            ctx.fillRect(-10, 30, 6, 8);
            ctx.fillRect(4, 30, 6, 8);
            // Chinelos
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-12, 36, 8, 3);
            ctx.fillRect(2, 36, 8, 3);
            
            // Head
            ctx.fillStyle = '#c59b7b';
            ctx.beginPath();
            ctx.arc(0, -14, 9, 0, Math.PI * 2);
            ctx.fill();
            
            // Bucket Hat (Chapéu de pescador)
            ctx.fillStyle = '#334433';
            ctx.fillRect(-14, -20, 28, 4); // brim
            ctx.fillRect(-10, -26, 20, 7); // crown
            
            // Sunglasses
            ctx.fillStyle = '#000000';
            ctx.fillRect(1, -15, 6, 3);
            
        } else if (this.type === 'motoqueiro') {
            // ----------------------------------------------------
            // DRAW MOTOQUEIRO CORTANDO O GIRO (NA CG 160)
            // ----------------------------------------------------
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(255, 100, 0, 0.4)';
            
            // Wheels
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.arc(-20, 14, 11, 0, Math.PI * 2); // Rear wheel
            ctx.arc(18, 4, 11, 0, Math.PI * 2);   // Front wheel (lifted in wheelie / grau!)
            ctx.fill();
            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(-20, 14, 5, 0, Math.PI * 2);
            ctx.arc(18, 4, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Motorcycle frame & red CG 160 gas tank
            ctx.fillStyle = '#d32f2f'; // Red motorcycle
            ctx.beginPath();
            ctx.moveTo(-10, 10);
            ctx.lineTo(8, -2);
            ctx.lineTo(14, 2);
            ctx.lineTo(-6, 14);
            ctx.closePath();
            ctx.fill();
            
            // Chrome exhaust pipe
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-4, 14);
            ctx.lineTo(-24, 18);
            ctx.stroke();
            
            // Rider on motorcycle (popping wheelie)
            ctx.fillStyle = '#1565c0'; // blue shirt
            ctx.fillRect(-12, -14, 16, 18);
            ctx.fillStyle = '#212121'; // pants
            ctx.fillRect(-14, 4, 14, 10);
            
            // Rider head with backwards red cap
            ctx.fillStyle = '#d7a276'; // face
            ctx.beginPath();
            ctx.arc(-4, -22, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff1744'; // red cap
            ctx.fillRect(-12, -26, 16, 5);
            ctx.fillRect(-16, -23, 6, 3); // flap
            
            // Floating "RAN-DAN-DAN!" sound text
            ctx.fillStyle = '#ffd700';
            ctx.font = "bold 8px 'Press Start 2P', monospace";
            ctx.fillText("RAN-DAN!", -25, -30);
            
        } else if (this.type === 'dona_fila') {
            // ----------------------------------------------------
            // DRAW DONA FILA (CHEFÃO DO MERCADINHO TALISMÃ)
            // ----------------------------------------------------
            ctx.shadowBlur = this.enraged ? 12 : 6;
            ctx.shadowColor = this.enraged ? 'rgba(255, 0, 50, 0.8)' : 'rgba(255, 100, 200, 0.5)';
            
            // Enraged aura when low health
            if (this.enraged) {
                ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
                ctx.lineWidth = 2;
                ctx.strokeRect(-22, -34, 44, 70);
            }
            
            // Pink Floral House Dress / Apron
            ctx.fillStyle = '#e91e63';
            ctx.fillRect(-16, -10, 32, 44);
            // Yellow floral pattern dots
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(-10, 0, 3, 3);
            ctx.fillRect(6, 4, 3, 3);
            ctx.fillRect(-6, 16, 3, 3);
            ctx.fillRect(8, 22, 3, 3);
            ctx.fillRect(-10, 26, 3, 3);
            
            // Legs & Pink Slippers
            ctx.fillStyle = '#e0a982';
            ctx.fillRect(-12, 34, 8, 8);
            ctx.fillRect(4, 34, 8, 8);
            ctx.fillStyle = '#f48fb1';
            ctx.fillRect(-14, 40, 10, 4);
            ctx.fillRect(2, 40, 10, 4);
            
            // Head
            ctx.fillStyle = '#e0a982';
            ctx.beginPath();
            ctx.arc(0, -22, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Hair with Curler Rollers (Bobes de cabelo)
            ctx.fillStyle = '#424242'; // hair base
            ctx.fillRect(-13, -28, 26, 8);
            // Pink curlers!
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(-10, -30, 4, 0, Math.PI * 2);
            ctx.arc(0, -32, 4, 0, Math.PI * 2);
            ctx.arc(10, -30, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Glasses & Angry mouth
            ctx.fillStyle = '#000000';
            ctx.fillRect(-8, -24, 6, 4);
            ctx.fillRect(2, -24, 6, 4);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(-8, -24, 6, 4);
            ctx.strokeRect(2, -24, 6, 4);
            ctx.fillStyle = '#d50000';
            ctx.fillRect(-4, -16, 8, 3); // scowl
            
            // Wooden Rolling Pin (Rolo de Macarrão gigante) in hand!
            ctx.save();
            const armAngle = Math.sin(Date.now() / 100) * 0.4;
            ctx.translate(14, 2);
            ctx.rotate(armAngle);
            ctx.fillStyle = '#d7ccc8'; // Wood rolling pin
            ctx.fillRect(0, -35, 6, 40);
            ctx.fillStyle = '#8d6e63'; // handles
            ctx.fillRect(1, -40, 4, 6);
            ctx.fillRect(1, 4, 4, 6);
            ctx.restore();
            
            // Other hand: "Caderneta do Fiado"
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-22, 0, 10, 14);
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(-20, 2, 6, 2); // Red title on notebook
            
            // Floating speech when angry
            if (this.enraged) {
                ctx.fillStyle = '#ff3366';
                ctx.font = "bold 7px 'Press Start 2P', monospace";
                ctx.fillText("PAGA O FIADO!", -30, -40);
            }
            
        } else if (this.type === 'dono_bar') {
            // ----------------------------------------------------
            // DRAW ANGRY BAR OWNER (SEU MANUEL)
            // ----------------------------------------------------
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(255,0,0,0.3)';
            
            // Angry red face/shirt
            ctx.fillStyle = '#d32f2f'; // Red polo shirt
            ctx.fillRect(-16, -12, 32, 42);
            
            // White Apron (covers front)
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(-12, 0, 24, 30);
            // Stains on apron
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-4, 10, 5, 4);
            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(4, 18, 4, 3);
            
            // Pants & Shoes
            ctx.fillStyle = '#212121';
            ctx.fillRect(-14, 30, 10, 8);
            ctx.fillRect(4, 30, 10, 8);
            
            // Head (Bald & Angry)
            ctx.fillStyle = '#ffd54f'; // skin tone
            ctx.beginPath();
            ctx.arc(0, -22, 11, 0, Math.PI * 2);
            ctx.fill();
            
            // Hair (Side bald pattern)
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(-12, -23, 3, 8);
            ctx.fillRect(9, -23, 3, 8);
            
            // Thick Portuguese Mustache
            ctx.fillStyle = '#1a0c00';
            ctx.fillRect(-6, -20, 12, 4);
            
            // Furiously glowing red eyes
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(-5, -26, 3, 2);
            ctx.fillRect(2, -26, 3, 2);
            
            // Broom / Rod weapon (animated)
            ctx.save();
            const sweep = Math.sin(Date.now() / 120) * 0.4;
            ctx.translate(10, 10);
            ctx.rotate(sweep);
            ctx.strokeStyle = '#8d6e63'; // broom handle
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(15, -45);
            ctx.stroke();
            // Straw brush
            ctx.fillStyle = '#fbc02d';
            ctx.fillRect(10, -48, 12, 14);
            ctx.restore();
        }
        
        ctx.restore();
    }
}

// Enemy projectile (tin cans, beer mugs, "Conta do Fiado", smoke puffs)
class EnemyProjectile {
    constructor(x, y, dir, type = 'can') {
        this.x = x;
        this.y = y;
        this.type = type; // 'can', 'mug', 'conta', 'smoke'
        this.width = 16;
        this.height = 16;
        this.vx = dir * (type === 'conta' ? 3.4 : 4.5);
        this.vy = type === 'conta' ? -5.0 : -7.5; // Flutter or lob trajectory
        this.angle = 0;
    }

    update() {
        if (this.type === 'conta') {
            this.vy += 0.16; // Light fluttering paper gravity
            this.x += Math.sin(Date.now() / 90) * 1.5; // Zigzag flutter!
        } else {
            this.vy += 0.35; // Strong gravity
        }
        this.x += this.vx;
        this.y += this.vy;
        this.angle += 0.15;
        
        return (this.y > 480); // delete if falls below screen
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.type === 'conta') {
            // "A Conta do Fiado" (fluttering white bill paper with red R$)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8, -12, 16, 24);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(-8, -12, 16, 24);
            // Red R$ on bill
            ctx.fillStyle = '#ff0033';
            ctx.font = "bold 9px monospace";
            ctx.textAlign = 'center';
            ctx.fillText('R$', 0, 0);
            ctx.fillStyle = '#888888';
            ctx.fillRect(-5, 4, 10, 2);
            ctx.fillRect(-5, 7, 7, 2);
        } else if (this.type === 'smoke') {
            // Smoke bomb puff
            ctx.fillStyle = 'rgba(180, 180, 180, 0.85)';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.arc(-4, -3, 6, 0, Math.PI * 2);
            ctx.arc(4, 2, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'mug') {
            // Glass Beer Mug
            ctx.fillStyle = '#e0f7fa';
            ctx.fillRect(-6, -6, 12, 12);
            ctx.fillStyle = '#ffd700'; // beer inside
            ctx.fillRect(-5, -2, 10, 7);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(-6, -6, 12, 12);
            // Handle
            ctx.strokeStyle = '#e0f7fa';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(6, 0, 4, -Math.PI/2, Math.PI/2);
            ctx.stroke();
        } else {
            // Crumpled Tin Can (Coca-Cola red)
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(-5, -7, 10, 14);
            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(-5, -7, 10, 2);
            ctx.fillRect(-5, 5, 10, 2);
        }
        
        ctx.restore();
    }
}

// ==========================================================================
// 6. THE PLAYABLE HERO (BIRA)
// ==========================================================================
class Player {
    constructor() {
        this.x = 80;
        this.y = 300;
        this.width = 38;
        this.height = 54;
        this.vx = 0;
        this.vy = 0;
        
        // Base mechanics
        this.isGrounded = false;
        this.lives = 3;
        this.score = 0;
        this.facing = 1; // 1 = right, -1 = left
        
        // Ammunition
        this.ammo = 3;
        this.maxAmmo = 3;
        
        // Drunk Meter
        this.drunkLevel = 0; // 0 to 100
        this.maxDrunk = 100;
        
        // Dash/Cambaleio
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.isDashing = false;
        
        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Invincibility frames when hit
        this.invincibleTimer = 0;
    }

    update(platforms, keys) {
        // Regulate counters
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.dashTimer > 0) {
            this.dashTimer--;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.vx *= 0.5; // abrupt slow down after dash
            }
        }
        
        // Passively digest alcohol very slowly
        if (this.drunkLevel > 0) {
            this.drunkLevel -= 0.015;
        } else {
            this.drunkLevel = 0;
        }

        // Drunk properties calculations
        // Higher drunk level = slipperier movement (less friction, higher drift)
        // Also gives bonus speed!
        let acceleration = 0.65;
        let friction = 0.82; // standard tight braking
        let maxWalkSpeed = 4.2;
        let jumpStrength = -10.5;
        
        if (this.drunkLevel > 20) {
            // Slightly tip-sy: nice speed boost, minor sliding
            acceleration = 0.8;
            friction = 0.88;
            maxWalkSpeed = 5.2;
            jumpStrength = -11.5;
        }
        if (this.drunkLevel > 60) {
            // Highly loaded: super speed, super slippy slide!
            acceleration = 1.1;
            friction = 0.94;
            maxWalkSpeed = 6.5;
            jumpStrength = -13.0;
        }

        // Handle Horizontal input controls
        if (!this.isDashing) {
            let leftPressed = keys['a'] || keys['ArrowLeft'] || keys['btn-left'];
            let rightPressed = keys['d'] || keys['ArrowRight'] || keys['btn-right'];
            
            // Drunk confusion effect: if Bira is > 85% drunk, controls occasionally invert!
            if (this.drunkLevel > 85 && Math.sin(Date.now() / 500) > 0.4) {
                const temp = leftPressed;
                leftPressed = rightPressed;
                rightPressed = temp;
            }

            if (leftPressed) {
                this.vx -= acceleration;
                this.facing = -1;
            } else if (rightPressed) {
                this.vx += acceleration;
                this.facing = 1;
            } else {
                this.vx *= friction; // Slide friction deceleration
            }
            
            // Limit speeds
            if (this.vx > maxWalkSpeed) this.vx = maxWalkSpeed;
            if (this.vx < -maxWalkSpeed) this.vx = -maxWalkSpeed;
        }
        
        // Handle Gravity & Jumping
        this.vy += 0.55; // Gravity acceleration
        
        const jumpPressed = keys['w'] || keys['ArrowUp'] || keys[' '] || keys['btn-jump'] || keys['btn-up'];
        if (jumpPressed && this.isGrounded && !this.isDashing) {
            this.vy = jumpStrength;
            this.isGrounded = false;
            game.sounds.playJump();
            // Spawn jump dust
            for (let i = 0; i < 4; i++) {
                game.particles.push(new Particle(this.x + this.width/2, this.y + this.height, 'dust'));
            }
        }
        
        // Dash Trigger ("Cambaleio")
        const dashPressed = keys['k'] || keys['c'] || keys['btn-dash'];
        if (dashPressed && this.dashCooldown === 0 && !this.isDashing) {
            this.isDashing = true;
            this.dashTimer = 15; // 15 frames of fast dash
            this.dashCooldown = 50; // 50 frames wait
            this.vy = -1.5; // slight pop off ground
            this.vx = this.facing * 12; // super speed forward
            game.sounds.playThrow(); // dash whoosh
            
            // Spawn dash bubbles
            for (let i = 0; i < 6; i++) {
                game.particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, 'beer'));
            }
        }
        
        // Update horizontal position
        this.x += this.vx;
        
        // Prevent player leaving canvas left boundary
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }

        // Handle platforms collisions
        this.isGrounded = false;
        platforms.forEach(plat => {
            // Horizontal check overlap
            if (this.x + this.width > plat.x && this.x < plat.x + plat.width) {
                // Standing on top check
                if (this.y + this.height <= plat.y && this.y + this.height + this.vy >= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                }
                // Hitting head under bottom check
                else if (this.y >= plat.y + plat.height && this.y + this.vy <= plat.y + plat.height) {
                    this.y = plat.y + plat.height;
                    this.vy = 0.5; // bounce slightly
                }
            }
        });
        
        // Update vertical position
        this.y += this.vy;
        
        // Ground boundary (safety fall prevention)
        if (this.y > 480) {
            this.takeDamage(true); // instant death by falling
        }
        
        // Animate
        if (Math.abs(this.vx) > 0.25 && this.isGrounded) {
            this.animTimer++;
            if (this.animTimer > 6) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.animFrame = 0;
        }
    }

    takeDamage(instantDeath = false) {
        if (this.invincibleTimer > 0 && !instantDeath) return;
        
        if (instantDeath) {
            this.lives--;
            if (this.lives > 0) {
                this.x = Math.max(80, this.x - 220);
                this.y = 120;
                this.vy = -2;
                this.vx = 0;
                this.invincibleTimer = 70;
                game.triggerScreenShake(14);
                game.sounds.playHit();
            }
        } else {
            this.lives--;
            this.invincibleTimer = 75; // Invincibility frames
            game.triggerScreenShake(12);
            game.sounds.playHit();
            
            // Lose points on hit
            this.score = Math.max(0, this.score - 50);
            
            // Spill some alcohol drops!
            for (let i = 0; i < 8; i++) {
                game.particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, 'beer'));
            }
        }
        
        // Sync HUD
        game.syncHUD();
        
        if (this.lives <= 0) {
            game.triggerGameOver();
        } else if (!instantDeath) {
            // Respawn bounce back
            this.y = 150;
            this.vy = -3;
            this.vx = -this.facing * 4;
        }
    }

    drinkAlcohol(type) {
        game.sounds.playDrink();
        
        let alcoholBoost = 15;
        let points = 20;
        
        if (type === 'cerveja') {
            alcoholBoost = 12;
            points = 25;
        } else if (type === 'corote') {
            alcoholBoost = 25; // Super loaded!
            points = 50;
        }
        
        this.drunkLevel = Math.min(this.maxDrunk, this.drunkLevel + alcoholBoost);
        this.score += points;
        
        // Spawn splashing bubbles
        for (let i = 0; i < 6; i++) {
            game.particles.push(new Particle(this.x + this.width/2, this.y + 10, 'beer'));
        }
        
        game.syncHUD();
    }

    eatCoxinha() {
        game.sounds.playCoxinha();
        
        // Recovery! Decreases drunk level & heals lives!
        this.drunkLevel = Math.max(0, this.drunkLevel - 30);
        
        if (this.lives < 3) {
            this.lives++;
            // Flash a visual heart effect on HUD
            const liverContainer = document.getElementById('hud-liver');
            if (liverContainer) {
                liverContainer.classList.add('healing');
                setTimeout(() => liverContainer.classList.remove('healing'), 400);
            }
        }
        
        this.score += 30; // Coxinha points!
        
        // Sparkle particles
        for (let i = 0; i < 8; i++) {
            game.particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, 'star'));
        }
        
        game.syncHUD();
    }

    draw(ctx) {
        // Flashing visibility when invincible
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Wobble when very drunk!
        if (this.drunkLevel > 50) {
            const wobbleAmount = (this.drunkLevel / 100) * 0.08;
            ctx.rotate(Math.sin(Date.now() / 150) * wobbleAmount);
        }

        // Direction scale mirror
        ctx.scale(this.facing, 1);
        
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.2)';
        
        // ----------------------------------------------------
        // DRAW BIRA
        // ----------------------------------------------------
        
        // 1. Chubby torso / belly (peach tone + white tank top)
        ctx.fillStyle = '#ffcc99'; // Skin tone
        ctx.fillRect(-15, -10, 30, 26); // body core
        
        // White Tank Top ("Camiseta regata" with a dirty food stain!)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-15, -10, 30, 18);
        ctx.fillStyle = '#a1887f'; // grease stain
        ctx.fillRect(-4, 0, 5, 3);
        
        // 2. Blue shorts ("bermuda de nylon")
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(-16, 8, 32, 10);
        
        // 3. Legs
        ctx.fillStyle = '#ffcc99';
        const legSwing = Math.sin(this.animFrame * (Math.PI / 2)) * 6;
        if (this.isGrounded && Math.abs(this.vx) > 0.25) {
            // Animated walking legs
            ctx.fillRect(-10, 18, 6, 8 + legSwing);
            ctx.fillRect(4, 18, 6, 8 - legSwing);
            // Red Flip-flops ("chinelo de dedo")
            ctx.fillStyle = '#f44336';
            ctx.fillRect(-12, 24 + legSwing, 9, 3);
            ctx.fillRect(2, 24 - legSwing, 9, 3);
        } else {
            // Standing or jumping stationary legs
            ctx.fillRect(-11, 18, 7, 8);
            ctx.fillRect(4, 18, 7, 8);
            ctx.fillStyle = '#f44336';
            ctx.fillRect(-13, 24, 10, 3);
            ctx.fillRect(2, 24, 10, 3);
        }

        // 4. Arms (holding a beer bottle!)
        ctx.fillStyle = '#ffcc99';
        if (this.isDashing) {
            // Blurred forward dash arms
            ctx.fillRect(-22, -8, 10, 6);
        } else {
            // Arm holding green bottle
            ctx.fillRect(10, -5, 10, 6); // forearm
            // Beer bottle in hand
            ctx.fillStyle = '#2e7d32'; // green bottle
            ctx.fillRect(16, -14, 5, 10);
        }

        // 5. Head & Face (messy hair, red nose)
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(0, -20, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Drunk sleepy eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(3, -24, 3, 2); // eye
        ctx.fillStyle = 'rgba(255, 0, 0, 0.45)'; // bloodshot eye shadow
        ctx.fillRect(2, -22, 5, 2);
        
        // Red Drunk Nose ("Nariz de pinguço")
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(8, -19, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Messy curly dark hair
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(-6, -26, 6, 0, Math.PI * 2);
        ctx.arc(0, -29, 6, 0, Math.PI * 2);
        ctx.arc(6, -26, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 6. Dash trail outline
        if (this.isDashing) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-18, -28, 36, 56);
        }
        
        ctx.restore();
    }
}

// ==========================================================================
// 7. LEVEL BUILDER & DESIGN
// ==========================================================================
class Platform {
    constructor(x, y, w, h, style = 'calçada') {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.style = style; // 'calçada', 'tijolo', 'laje'
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        
        if (this.style === 'calçada') {
            // Draw classic pavement (concrete platform with checkered top line)
            ctx.fillStyle = '#2b2436';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Neon glowing curb border (classic Brazilian yellow-black pattern)
            ctx.lineWidth = 4;
            const segmentSize = 30;
            for (let i = 0; i < this.width; i += segmentSize) {
                ctx.fillStyle = (Math.floor(i / segmentSize) % 2 === 0) ? '#ffcc00' : '#333333';
                ctx.fillRect(this.x + i, this.y, Math.min(segmentSize, this.width - i), 6);
            }
        } else if (this.style === 'tijolo') {
            // Red bricks (laje wall)
            ctx.fillStyle = '#a04838';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw brick grid lines
            ctx.strokeStyle = '#6d261a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            for (let i = 0; i < this.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y);
                ctx.lineTo(this.x + i, this.y + this.height);
                ctx.stroke();
            }
        } else if (this.style === 'laje') {
            // Blue concrete concrete block
            ctx.fillStyle = '#455a64';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Draw concrete texture dots
            ctx.fillStyle = '#37474f';
            for (let i = 5; i < this.width; i += 30) {
                ctx.fillRect(this.x + i, this.y + 8, 3, 3);
                ctx.fillRect(this.x + i + 15, this.y + 16, 2, 2);
            }
            // Glowing neon top edge
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(this.x, this.y, this.width, 4);
        }
        
        ctx.restore();
    }
}

// ==========================================================================
// 7.5. SUPER MARIO BROS 3 STYLE OVERWORLD MAP (JD. SÃO ARMANDO - ITAQUÁ)
// ==========================================================================
class WorldMap {
    constructor(game) {
        this.game = game;
        this.currentNodeId = 1; // Rua Pitangueira
        this.targetNodeId = 1;
        this.playerX = 200;
        this.playerY = 300;
        this.isMoving = false;
        this.moveSpeed = 4.5;
        this.animTimer = 0;
        this.animFrame = 0;
        this.keyDebounce = 0;
        this.alertMessage = "";
        this.alertTimer = 0;

        // Neighborhood Nodes: Jd. São Armando (Itaquaquecetuba)
        this.nodes = [
            { id: 0, x: 80,  y: 300, name: "Entrada do Bairro", type: "start", level: 0, unlocked: true, cleared: true, desc: "Ponto de partida em Itaquaquecetuba" },
            { id: 1, x: 200, y: 300, name: "Rua Pitangueira", type: "level", level: 1, unlocked: true, cleared: false, desc: "Fase 1: Asfalto quebrado, caramelo e noiados" },
            { id: 2, x: 360, y: 300, name: "Panorama 1", type: "level", level: 2, unlocked: false, cleared: false, desc: "Fase 2: Subida com motoqueiros cortando o giro!" },
            { id: 3, x: 500, y: 190, name: "Panorama 2", type: "level", level: 3, unlocked: false, cleared: false, desc: "Fase 3: Lajes altas, fios de luz e noiados" },
            { id: 4, x: 680, y: 190, name: "Mercadinho Talismã", type: "boss", level: 4, unlocked: false, cleared: false, desc: "CHEFÃO: Dona Fila cobrando a conta do fiado!" },
            // Placeholder locked nodes ("o restante das fases deixe sem nada por enquanto")
            { id: 5, x: 360, y: 140, name: "Rua das Flores", type: "locked", level: 0, unlocked: false, cleared: false, desc: "EM OBRAS: Asfalto pendente pela Prefeitura" },
            { id: 6, x: 500, y: 370, name: "Beco da Paz", type: "locked", level: 0, unlocked: false, cleared: false, desc: "EM OBRAS: Aguarde os próximos capítulos!" },
            { id: 7, x: 680, y: 370, name: "Morro da Caixa D'Água", type: "locked", level: 0, unlocked: false, cleared: false, desc: "EM OBRAS: Bairro em expansão!" }
        ];

        // Connection graph between nodes
        this.connections = [
            { from: 0, to: 1, dir: 'right' },
            { from: 1, to: 0, dir: 'left' },
            { from: 1, to: 2, dir: 'right' },
            { from: 2, to: 1, dir: 'left' },
            { from: 2, to: 3, dir: 'up' },
            { from: 3, to: 2, dir: 'down' },
            { from: 3, to: 4, dir: 'right' },
            { from: 4, to: 3, dir: 'left' },
            // Locked branches
            { from: 2, to: 5, dir: 'up' },
            { from: 2, to: 6, dir: 'down' },
            { from: 6, to: 7, dir: 'right' }
        ];

        this.initTouchHandler();
        this.loadProgress();
    }

    loadProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem('longuinhoMapProgress'));
            if (saved && Array.isArray(saved)) {
                saved.forEach(s => {
                    const node = this.nodes.find(n => n.id === s.id);
                    if (node) {
                        node.unlocked = s.unlocked;
                        node.cleared = s.cleared;
                    }
                });
            }
        } catch (e) {}
    }

    saveProgress() {
        try {
            const save = this.nodes.map(n => ({ id: n.id, unlocked: n.unlocked, cleared: n.cleared }));
            localStorage.setItem('longuinhoMapProgress', JSON.stringify(save));
        } catch (e) {}
    }

    clearLevel(lvlNum) {
        const clearedNode = this.nodes.find(n => n.level === lvlNum);
        if (clearedNode) {
            clearedNode.cleared = true;
        }
        // Unlock next stage sequentially
        if (lvlNum === 1) {
            const next = this.nodes.find(n => n.level === 2);
            if (next) {
                next.unlocked = true;
                this.moveToNode(next.id);
            }
        } else if (lvlNum === 2) {
            const next = this.nodes.find(n => n.level === 3);
            if (next) {
                next.unlocked = true;
                this.moveToNode(next.id);
            }
        } else if (lvlNum === 3) {
            const next = this.nodes.find(n => n.level === 4);
            if (next) {
                next.unlocked = true;
                this.moveToNode(next.id);
            }
        }
        this.saveProgress();
    }

    initTouchHandler() {
        const canvas = this.game.canvas;
        if (!canvas) return;

        const handleCanvasClick = (e) => {
            if (this.game.state !== 'MAP') return;
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (clientX - rect.left) * scaleX;
            const clickY = (clientY - rect.top) * scaleY;

            // Check if clicked near any node (within 35px)
            for (let node of this.nodes) {
                const dist = Math.hypot(clickX - node.x, clickY - node.y);
                if (dist < 38) {
                    if (node.unlocked) {
                        if (this.currentNodeId === node.id && !this.isMoving) {
                            this.enterCurrentStage();
                        } else {
                            this.moveToNode(node.id);
                        }
                    } else {
                        this.showAlert("🚧 EM OBRAS! A Prefeitura de Itaquá ainda não asfaltou essa rua!");
                    }
                    return;
                }
            }

            // Also check if clicked bottom enter box
            if (clickY > 400 && clickY < 460 && clickX > 150 && clickX < 650) {
                this.enterCurrentStage();
            }
        };

        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });
    }

    showAlert(msg) {
        this.alertMessage = msg;
        this.alertTimer = 160;
        this.game.sounds.playBossHit();
    }

    moveToNode(targetId) {
        const targetNode = this.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        if (!targetNode.unlocked) {
            this.showAlert("🚧 EM OBRAS! Essa rua está sem asfalto por enquanto!");
            return;
        }

        this.targetNodeId = targetId;
        this.isMoving = true;
        this.game.sounds.playMapMove();
    }

    enterCurrentStage() {
        const node = this.nodes.find(n => n.id === this.currentNodeId);
        if (!node) return;

        if (node.level > 0 && node.unlocked) {
            this.game.sounds.playJump();
            this.game.startLevel(node.level);
        } else if (node.type === 'locked') {
            this.showAlert("🚧 EM OBRAS! O Jd. São Armando está expandindo em breve!");
        }
    }

    update(keys) {
        if (this.alertTimer > 0) this.alertTimer--;

        // Animation bobbing
        this.animTimer++;
        if (this.animTimer > 10) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }

        // Interpolate player position between nodes
        if (this.isMoving) {
            const targetNode = this.nodes.find(n => n.id === this.targetNodeId);
            if (targetNode) {
                const dx = targetNode.x - this.playerX;
                const dy = targetNode.y - this.playerY;
                const dist = Math.hypot(dx, dy);

                if (dist < this.moveSpeed) {
                    this.playerX = targetNode.x;
                    this.playerY = targetNode.y;
                    this.currentNodeId = this.targetNodeId;
                    this.isMoving = false;
                } else {
                    this.playerX += (dx / dist) * this.moveSpeed;
                    this.playerY += (dy / dist) * this.moveSpeed;
                }
            }
            return; // Don't take new directional inputs while walking between nodes
        }

        // D-Pad navigation on map
        if (this.keyDebounce > 0) {
            this.keyDebounce--;
            return;
        }

        let moveDir = null;
        if (keys['a'] || keys['ArrowLeft'] || keys['btn-left']) moveDir = 'left';
        else if (keys['d'] || keys['ArrowRight'] || keys['btn-right']) moveDir = 'right';
        else if (keys['w'] || keys['ArrowUp'] || keys['btn-up']) moveDir = 'up';
        else if (keys['s'] || keys['ArrowDown'] || keys['btn-down']) moveDir = 'down';

        if (moveDir) {
            this.keyDebounce = 16;
            // Find adjacent connection in that direction
            const conn = this.connections.find(c => c.from === this.currentNodeId && c.dir === moveDir);
            if (conn) {
                this.moveToNode(conn.to);
            }
        }

        // Enter stage button (Button A, Button Dash, or Space / Enter / START)
        const enterPressed = keys[' '] || keys['Enter'] || keys['btn-jump'] || keys['btn-dash'] || keys['btn-throw'];
        if (enterPressed && this.keyDebounce === 0) {
            this.keyDebounce = 25;
            this.enterCurrentStage();
        }
    }

    draw(ctx) {
        ctx.save();

        // ----------------------------------------------------
        // 1. MAP BACKGROUND & STREET TERRAIN (JD. SÃO ARMANDO)
        // ----------------------------------------------------
        ctx.fillStyle = '#1c152a';
        ctx.fillRect(0, 0, 800, 480);

        // Asphalt street grid texture
        ctx.fillStyle = '#261e38';
        for (let x = 0; x < 800; x += 40) {
            for (let y = 60; y < 420; y += 40) {
                if ((x + y) % 80 === 0) {
                    ctx.fillRect(x + 2, y + 2, 36, 36);
                }
            }
        }

        // Brazilian Favela / Neighborhood Pixel Houses along the map
        this.drawNeighborhoodDecor(ctx);

        // ----------------------------------------------------
        // 2. CONNECTING ROADS (SMB3 DOTTED/SOLID PATHS)
        // ----------------------------------------------------
        this.connections.forEach(c => {
            const n1 = this.nodes.find(n => n.id === c.from);
            const n2 = this.nodes.find(n => n.id === c.to);
            if (n1 && n2 && c.from < c.to) { // Draw once per pair
                const isPathUnlocked = n1.unlocked && n2.unlocked;

                // Road base
                ctx.strokeStyle = isPathUnlocked ? '#3d3056' : '#221933';
                ctx.lineWidth = 14;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();

                // Yellow-black curbs or dashed center line
                ctx.strokeStyle = isPathUnlocked ? '#ffd700' : '#44375a';
                ctx.lineWidth = 2;
                ctx.setLineDash(isPathUnlocked ? [6, 6] : [3, 9]);
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
                ctx.setLineDash([]); // Reset dash
            }
        });

        // ----------------------------------------------------
        // 3. MAP NODES (SMB3 STAGES & BOSSHOUSE)
        // ----------------------------------------------------
        this.nodes.forEach(node => {
            ctx.save();
            ctx.translate(node.x, node.y);

            const isSelected = (node.id === this.currentNodeId && !this.isMoving);
            const pulse = isSelected ? Math.sin(Date.now() / 150) * 3 : 0;

            if (node.type === 'start') {
                // Chequered start finish line
                ctx.fillStyle = '#ff9800';
                ctx.fillRect(-14, -14, 28, 28);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-12, -12, 12, 12);
                ctx.fillRect(0, 0, 12, 12);
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, -12, 12, 12);
                ctx.fillRect(-12, 0, 12, 12);
            } else if (node.type === 'boss') {
                // Mercadinho Talismã Storefront Node!
                ctx.shadowBlur = isSelected ? 15 : 6;
                ctx.shadowColor = node.unlocked ? 'var(--neon-green)' : 'rgba(0,0,0,0.5)';

                // Building base
                ctx.fillStyle = node.unlocked ? '#1b4d24' : '#2c2538';
                ctx.fillRect(-22, -20 + pulse, 44, 38);
                ctx.strokeStyle = node.unlocked ? 'var(--neon-green)' : '#4a3b63';
                ctx.lineWidth = 2;
                ctx.strokeRect(-22, -20 + pulse, 44, 38);

                // Striped Awning (Toldo do mercadinho)
                for (let i = -22; i < 22; i += 7) {
                    ctx.fillStyle = (Math.floor(i / 7) % 2 === 0) ? '#ffcc00' : '#2e7d32';
                    ctx.fillRect(i, -20 + pulse, 7, 8);
                }

                // Sign
                ctx.fillStyle = '#ffd700';
                ctx.font = "bold 6px 'Press Start 2P', monospace";
                ctx.textAlign = 'center';
                ctx.fillText("TALISMA", 0, -2 + pulse);
                ctx.fillStyle = '#ffffff';
                ctx.fillText("DONA FILA", 0, 8 + pulse);
            } else if (node.type === 'level') {
                // SMB3 Numbered Level Tile
                ctx.shadowBlur = isSelected ? 12 : 4;
                ctx.shadowColor = isSelected ? 'var(--neon-yellow)' : 'rgba(0,0,0,0.4)';

                ctx.fillStyle = node.cleared ? '#2e7d32' : (node.unlocked ? '#e65100' : '#2d243d');
                ctx.beginPath();
                ctx.arc(0, pulse, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = node.unlocked ? '#ffffff' : '#45385d';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Number or Cleared Star
                ctx.fillStyle = '#ffffff';
                ctx.font = "bold 10px 'Press Start 2P', monospace";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (node.cleared) {
                    ctx.fillText("🍺", 0, pulse);
                } else {
                    ctx.fillText(node.level, 0, pulse + 1);
                }
            } else {
                // Locked / Em obras node
                ctx.fillStyle = '#1c152a';
                ctx.fillRect(-14, -14, 28, 28);
                ctx.strokeStyle = '#fbc02d';
                ctx.lineWidth = 2;
                ctx.strokeRect(-14, -14, 28, 28);
                // Lock / Hazard sign
                ctx.fillStyle = '#fbc02d';
                ctx.font = "12px sans-serif";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("🔒", 0, 0);
            }

            ctx.restore();
        });

        // ----------------------------------------------------
        // 4. MINI SR. LONGUINHO ON MAP
        // ----------------------------------------------------
        ctx.save();
        ctx.translate(this.playerX, this.playerY - 14);
        const bob = Math.sin(this.animFrame * (Math.PI / 2)) * 3;

        // White tank top & chubby body
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(-7, -4 + bob, 14, 14);
        ctx.fillStyle = '#ffffff'; // regata
        ctx.fillRect(-7, -4 + bob, 14, 9);
        // Blue shorts
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(-7, 5 + bob, 14, 5);
        // Red chinelos
        ctx.fillStyle = '#f44336';
        ctx.fillRect(-6, 10 + bob, 4, 3);
        ctx.fillRect(2, 10 + bob, 4, 3);
        // Beer bottle in hand
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(8, -2 + bob, 3, 7);
        // Head with red nose
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(0, -9 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e91e63'; // red nose
        ctx.fillRect(2, -8 + bob, 2.5, 2);
        ctx.fillStyle = '#3e2723'; // hair
        ctx.fillRect(-4, -15 + bob, 8, 3);

        ctx.restore();

        // ----------------------------------------------------
        // 5. TOP HEADER BANNER (MUNDO 1: JD. SÃO ARMANDO)
        // ----------------------------------------------------
        ctx.fillStyle = 'rgba(14, 10, 22, 0.92)';
        ctx.fillRect(0, 0, 800, 48);
        ctx.strokeStyle = 'var(--neon-yellow)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 800, 48);

        ctx.fillStyle = 'var(--neon-yellow)';
        ctx.font = "bold 12px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("★ MUNDO 1: JD. SÃO ARMANDO (ITAQUÁ) ★", 400, 24);

        // ----------------------------------------------------
        // 6. BOTTOM SELECTION INFO CARD
        // ----------------------------------------------------
        const curr = this.nodes.find(n => n.id === this.currentNodeId);
        if (curr) {
            ctx.fillStyle = 'rgba(16, 12, 26, 0.94)';
            ctx.fillRect(100, 410, 600, 60);
            ctx.strokeStyle = curr.unlocked ? 'var(--neon-green)' : '#ffaa00';
            ctx.lineWidth = 2;
            ctx.strokeRect(100, 410, 600, 60);

            // Stage title
            ctx.fillStyle = curr.unlocked ? 'var(--neon-green)' : '#ffaa00';
            ctx.font = "bold 9px 'Press Start 2P', monospace";
            ctx.textAlign = 'center';
            ctx.fillText(curr.name.toUpperCase(), 400, 426);

            // Description / Tips
            ctx.fillStyle = '#d2c7e8';
            ctx.font = "11px 'Outfit', sans-serif";
            ctx.fillText(curr.desc, 400, 444);

            // Call to action
            ctx.fillStyle = curr.unlocked ? 'var(--neon-yellow)' : '#ff7777';
            ctx.font = "bold 9px 'Press Start 2P', monospace";
            if (curr.unlocked && curr.level > 0) {
                ctx.fillText("[ APERTE A OU TOQUE AQUI PARA ENTRAR ]", 400, 460);
            } else if (curr.type === 'start') {
                ctx.fillText("[ USE O D-PAD OU TOQUE NAS FASES ]", 400, 460);
            } else {
                ctx.fillText("[ 🚧 RUA EM OBRAS PELA PREFEITURA ]", 400, 460);
            }
        }

        // ----------------------------------------------------
        // 7. ALERT POPUP BANNER (EM OBRAS)
        // ----------------------------------------------------
        if (this.alertTimer > 0) {
            ctx.fillStyle = 'rgba(255, 170, 0, 0.95)';
            ctx.fillRect(80, 180, 640, 70);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(80, 180, 640, 70);

            ctx.fillStyle = '#0b0713';
            ctx.font = "bold 9px 'Press Start 2P', monospace";
            ctx.textAlign = 'center';
            ctx.fillText("AVISO DA PREFEITURA DE ITAQUAQUECETUBA:", 400, 204);

            ctx.font = "bold 13px 'Outfit', sans-serif";
            ctx.fillText(this.alertMessage, 400, 228);
        }

        ctx.restore();
    }

    drawNeighborhoodDecor(ctx) {
        // Decorative pixel houses in Jd. São Armando with caixas d'água
        const houses = [
            { x: 120, y: 180, w: 45, h: 40, color: '#a04838' },
            { x: 230, y: 160, w: 50, h: 50, color: '#c55a40' },
            { x: 420, y: 90,  w: 48, h: 42, color: '#8d4530' },
            { x: 570, y: 100, w: 52, h: 45, color: '#a04838' },
            { x: 140, y: 390, w: 48, h: 40, color: '#c55a40' },
            { x: 280, y: 390, w: 50, h: 42, color: '#8d4530' },
            { x: 580, y: 290, w: 46, h: 40, color: '#a04838' },
            { x: 720, y: 100, w: 50, h: 46, color: '#c55a40' }
        ];

        houses.forEach(h => {
            // Brick house
            ctx.fillStyle = h.color;
            ctx.fillRect(h.x, h.y, h.w, h.h);
            // Gray concrete slab (laje)
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(h.x - 2, h.y, h.w + 4, 6);
            // Blue Water Tank (Caixa D'água)
            ctx.fillStyle = '#0288d1';
            ctx.beginPath();
            ctx.arc(h.x + h.w / 2, h.y - 4, 7, 0, Math.PI * 2);
            ctx.fill();
            // Tiny window
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(h.x + 8, h.y + 14, 8, 8);
            // Door
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(h.x + h.w - 16, h.y + h.h - 14, 10, 14);
        });

        // Overhead electric wires between poles
        ctx.strokeStyle = '#2b2042';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 120);
        ctx.bezierCurveTo(250, 140, 450, 110, 750, 130);
        ctx.stroke();

        // Hanging sneakers on power line!
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(380, 123, 5, 4);
        ctx.fillRect(383, 126, 5, 4);
    }
}

// ==========================================================================
// 8. THE MAIN CORE CONTROLLER (GAME ENGINE)
// ==========================================================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.sounds = new SoundEffects();
        this.player = new Player();
        
        // Input bindings
        this.keys = {};
        
        // Entities arrays
        this.platforms = [];
        this.items = [];
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        
        // Game states
        this.state = 'MENU'; // MENU, PLAYING, INSTRUCTIONS, GAMEOVER, VICTORY, PAUSED
        this.score = 0;
        this.level = 1;
        this.maxLevel = 3;
        
        // Screen Shake
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        
        // Camera horizontal viewport
        this.cameraX = 0;
        this.levelWidth = 3200; // Level size
        
        // Finish Line / Victory goal
        this.goalX = 3000;
        
        // High Score list local storage
        this.highScores = JSON.parse(localStorage.getItem('longuinhoHighScores')) || [
            { name: "Sr. Longuinho", score: 1500 },
            { name: "Zeca do Copo", score: 1200 },
            { name: "Caramelo", score: 900 },
            { name: "Seu Manuel", score: 500 },
            { name: "Visitante", score: 100 }
        ];

        this.worldMap = new WorldMap(this);
        this.levelName = "Rua Pitangueira";
        this.stageClearTimer = 0;
        this.bossDefeated = false;
        this.maxLevel = 4;

        this.initInputs();
        this.initDOMButtons();
        this.renderHighScores();
    }

    startNewGame() {
        this.sounds.init();
        this.player = new Player();
        this.score = 0;
        this.state = 'MAP';
        this.hideAllScreens();
        this.syncHUD();
    }

    startLevel(lvlNum) {
        this.level = lvlNum;
        this.loadLevel(this.level);
        this.state = 'PLAYING';
        this.hideAllScreens();
        this.syncHUD();
    }

    loadLevel(lvlNum) {
        this.platforms = [];
        this.items = [];
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.bossDefeated = false;
        this.stageClearTimer = 0;
        
        this.cameraX = 0;
        this.player.x = 80;
        this.player.y = 200;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.drunkLevel = Math.max(0, this.player.drunkLevel - 20);

        if (lvlNum === 1) {
            // ----------------------------------------------------
            // FASE 1: RUA PITANGUEIRA (JD. SÃO ARMANDO)
            // ----------------------------------------------------
            this.levelName = "Rua Pitangueira";
            this.levelWidth = 2600;
            this.goalX = 2450;
            
            // Ground sidewalk platforms
            this.platforms.push(new Platform(0, 420, 800, 60, 'calçada'));
            this.platforms.push(new Platform(900, 420, 600, 60, 'calçada'));
            this.platforms.push(new Platform(1600, 420, 1100, 60, 'calçada'));
            
            // Suspended platforms
            this.platforms.push(new Platform(250, 300, 180, 20, 'laje'));
            this.platforms.push(new Platform(500, 220, 150, 20, 'laje'));
            this.platforms.push(new Platform(700, 320, 120, 20, 'tijolo'));
            this.platforms.push(new Platform(1000, 300, 200, 20, 'tijolo'));
            this.platforms.push(new Platform(1300, 200, 150, 20, 'laje'));
            this.platforms.push(new Platform(1750, 320, 160, 20, 'laje'));
            this.platforms.push(new Platform(2000, 220, 200, 20, 'tijolo'));

            // Collectibles
            this.items.push(new Item(300, 250, 'cerveja'));
            this.items.push(new Item(550, 170, 'cerveja'));
            this.items.push(new Item(1100, 250, 'corote'));
            this.items.push(new Item(1350, 150, 'coxinha'));
            this.items.push(new Item(1800, 270, 'chinelo'));
            this.items.push(new Item(2100, 170, 'coxinha'));

            // Enemies (Caramelos, Mendigos, Noiados)
            this.enemies.push(new Enemy(450, 380, 'caramelo'));
            this.enemies.push(new Enemy(1050, 250, 'noiado'));
            this.enemies.push(new Enemy(1200, 380, 'mendigo'));
            this.enemies.push(new Enemy(1800, 380, 'caramelo'));
            this.enemies.push(new Enemy(2050, 170, 'noiado'));
            
        } else if (lvlNum === 2) {
            // ----------------------------------------------------
            // FASE 2: PANORAMA 1 (JD. SÃO ARMANDO)
            // ----------------------------------------------------
            this.levelName = "Panorama 1";
            this.levelWidth = 2800;
            this.goalX = 2650;
            
            // Fractured floor
            this.platforms.push(new Platform(0, 420, 600, 60, 'calçada'));
            this.platforms.push(new Platform(700, 420, 500, 60, 'calçada'));
            this.platforms.push(new Platform(1300, 420, 800, 60, 'calçada'));
            this.platforms.push(new Platform(2200, 420, 700, 60, 'calçada'));
            
            // Higher platforms
            this.platforms.push(new Platform(200, 300, 150, 20, 'tijolo'));
            this.platforms.push(new Platform(400, 200, 180, 20, 'laje'));
            this.platforms.push(new Platform(800, 300, 200, 20, 'laje'));
            this.platforms.push(new Platform(1100, 220, 150, 20, 'tijolo'));
            this.platforms.push(new Platform(1450, 320, 200, 20, 'laje'));
            this.platforms.push(new Platform(1750, 220, 180, 20, 'laje'));
            this.platforms.push(new Platform(2300, 300, 180, 20, 'laje'));

            // Collectibles
            this.items.push(new Item(450, 150, 'corote'));
            this.items.push(new Item(850, 250, 'cerveja'));
            this.items.push(new Item(1150, 170, 'coxinha'));
            this.items.push(new Item(1500, 270, 'chinelo'));
            this.items.push(new Item(1800, 170, 'corote'));
            this.items.push(new Item(2350, 250, 'coxinha'));

            // Enemies (Introduces Motoqueiro Cortando o Giro!)
            this.enemies.push(new Enemy(400, 380, 'caramelo'));
            this.enemies.push(new Enemy(900, 380, 'motoqueiro')); // CG 160 revving!
            this.enemies.push(new Enemy(1450, 250, 'noiado'));
            this.enemies.push(new Enemy(1600, 380, 'mendigo'));
            this.enemies.push(new Enemy(2300, 380, 'motoqueiro'));
            
        } else if (lvlNum === 3) {
            // ----------------------------------------------------
            // FASE 3: PANORAMA 2 (JD. SÃO ARMANDO)
            // ----------------------------------------------------
            this.levelName = "Panorama 2";
            this.levelWidth = 3000;
            this.goalX = 2850;
            
            // Sparse ground floor
            this.platforms.push(new Platform(0, 420, 500, 60, 'calçada'));
            this.platforms.push(new Platform(650, 420, 400, 60, 'calçada'));
            this.platforms.push(new Platform(1200, 420, 400, 60, 'calçada'));
            this.platforms.push(new Platform(1800, 420, 500, 60, 'calçada'));
            this.platforms.push(new Platform(2500, 420, 600, 60, 'calçada'));
            
            // High climbing platforms
            this.platforms.push(new Platform(150, 300, 120, 20, 'tijolo'));
            this.platforms.push(new Platform(300, 200, 120, 20, 'laje'));
            this.platforms.push(new Platform(700, 300, 180, 20, 'laje'));
            this.platforms.push(new Platform(950, 200, 180, 20, 'tijolo'));
            this.platforms.push(new Platform(1300, 320, 120, 20, 'laje'));
            this.platforms.push(new Platform(1500, 220, 120, 20, 'tijolo'));
            this.platforms.push(new Platform(1900, 300, 220, 20, 'laje'));
            this.platforms.push(new Platform(2200, 200, 180, 20, 'tijolo'));
            this.platforms.push(new Platform(2600, 300, 150, 20, 'laje'));

            // Collectibles
            this.items.push(new Item(350, 150, 'corote'));
            this.items.push(new Item(750, 250, 'coxinha'));
            this.items.push(new Item(1000, 150, 'cerveja'));
            this.items.push(new Item(1550, 170, 'chinelo'));
            this.items.push(new Item(2000, 250, 'corote'));
            this.items.push(new Item(2300, 150, 'coxinha'));

            // Enemies (Motoqueiros, Noiados, Mendigos, Caramelos)
            this.enemies.push(new Enemy(350, 380, 'caramelo'));
            this.enemies.push(new Enemy(750, 250, 'noiado'));
            this.enemies.push(new Enemy(1350, 380, 'motoqueiro'));
            this.enemies.push(new Enemy(1700, 250, 'noiado'));
            this.enemies.push(new Enemy(2000, 380, 'mendigo'));
            this.enemies.push(new Enemy(2600, 380, 'motoqueiro'));
            
        } else if (lvlNum === 4) {
            // ----------------------------------------------------
            // FASE 4: MERCADINHO TALISMÃ - CHEFÃO: DONA FILA
            // ----------------------------------------------------
            this.levelName = "Mercadinho Talismã (Dona Fila)";
            this.levelWidth = 1400;
            this.goalX = 99999; // Defeat boss to win!
            
            // Arena Floor & Shelves
            this.platforms.push(new Platform(0, 420, 1400, 60, 'calçada'));
            // Beer crates & counter platforms
            this.platforms.push(new Platform(350, 310, 140, 20, 'tijolo'));
            this.platforms.push(new Platform(550, 220, 180, 20, 'laje'));
            this.platforms.push(new Platform(800, 220, 180, 20, 'laje'));
            this.platforms.push(new Platform(1050, 310, 140, 20, 'tijolo'));

            // Arena power-ups
            this.items.push(new Item(400, 260, 'coxinha'));
            this.items.push(new Item(600, 170, 'cerveja'));
            this.items.push(new Item(850, 170, 'chinelo'));
            this.items.push(new Item(1100, 260, 'coxinha'));

            // Boss: DONA FILA!
            this.enemies.push(new Enemy(850, 350, 'dona_fila'));
        }
        
        // Confetti stars on level load
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(200 + Math.random() * 400, 100 + Math.random()*200, 'star'));
        }
    }

    spawnEnemyProjectile(x, y, dir, type = 'can') {
        this.enemyProjectiles.push(new EnemyProjectile(x, y, dir, type));
        this.sounds.playThrow();
    }

    triggerScreenShake(intensity) {
        this.shakeTime = 12; // Shake duration in frames
        this.shakeIntensity = intensity;
    }

    initInputs() {
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            this.keys[e.key.toLowerCase()] = true; // handle case issues
            
            // Game pausing trigger
            if (e.key === 'p' || e.key === 'P') {
                if (this.state === 'PLAYING') {
                    this.state = 'PAUSED';
                    document.getElementById('screen-paused').classList.remove('hidden');
                } else if (this.state === 'PAUSED') {
                    this.state = 'PLAYING';
                    document.getElementById('screen-paused').classList.add('hidden');
                }
            }
            
            // X or J to throw Flip-Flop
            if ((e.key === 'x' || e.key === 'X' || e.key === 'j' || e.key === 'J') && this.state === 'PLAYING') {
                this.throwChinelo();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    initDOMButtons() {
        // UI Screens buttons
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-how-to').addEventListener('click', () => {
            this.state = 'INSTRUCTIONS';
            this.hideAllScreens();
            document.getElementById('screen-instructions').classList.remove('hidden');
            this.sounds.init();
        });

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            this.state = 'MENU';
            this.hideAllScreens();
            document.getElementById('screen-menu').classList.remove('hidden');
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-victory-restart').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            this.state = 'PLAYING';
            document.getElementById('screen-paused').classList.add('hidden');
        });

        // Audio controls hooks
        const musicBtn = document.getElementById('btn-toggle-music');
        musicBtn.addEventListener('click', () => {
            const on = this.sounds.toggleMusic();
            musicBtn.innerText = on ? "🎵 MÚSICA: ON" : "🎵 MÚSICA: OFF";
            musicBtn.classList.toggle('active', on);
        });

        const sfxBtn = document.getElementById('btn-toggle-sfx');
        sfxBtn.addEventListener('click', () => {
            const on = this.sounds.toggleSFX();
            sfxBtn.innerText = on ? "🔊 EFEITOS: ON" : "🔊 EFEITOS: OFF";
            sfxBtn.classList.toggle('active', on);
        });

        // Game Boy START Button (Menu, Pause, Resume, Restart)
        const startBtn = document.getElementById('btn-pause-start');
        if (startBtn) {
            const handleStart = (e) => {
                if (e) e.preventDefault();
                startBtn.classList.add('pressed');
                setTimeout(() => startBtn.classList.remove('pressed'), 120);

                if (this.state === 'MENU') {
                    this.startNewGame();
                } else if (this.state === 'PLAYING') {
                    this.state = 'PAUSED';
                    document.getElementById('screen-paused').classList.remove('hidden');
                } else if (this.state === 'PAUSED') {
                    this.state = 'PLAYING';
                    document.getElementById('screen-paused').classList.add('hidden');
                } else if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
                    this.startNewGame();
                }
            };
            startBtn.addEventListener('touchstart', handleStart, { passive: false });
            startBtn.addEventListener('click', handleStart);
        }

        // Setup Virtual Game Boy Button helper with tactile feedback
        const setupGBButton = (id, key, isThrow = false) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const press = (e) => {
                if (e) e.preventDefault();
                this.keys[key] = true;
                btn.classList.add('pressed');
                if (isThrow) this.throwChinelo();
            };
            const release = (e) => {
                if (e) e.preventDefault();
                this.keys[key] = false;
                btn.classList.remove('pressed');
            };
            
            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('touchcancel', release, { passive: false });
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
        };

        // Wire Up Game Boy Buttons
        setupGBButton('btn-left', 'btn-left');
        setupGBButton('btn-right', 'btn-right');
        setupGBButton('btn-up', 'btn-up');
        setupGBButton('btn-down', 'btn-down');
        setupGBButton('btn-jump', 'btn-jump');
        setupGBButton('btn-dash', 'btn-dash');
        setupGBButton('btn-throw', 'btn-throw', true);

        // Smooth D-Pad Touch-Slide support (allows sliding thumb between directions!)
        const dpadContainer = document.getElementById('gb-dpad');
        if (dpadContainer) {
            let activeDpadTouchId = null;

            const handleDpadTouch = (e) => {
                e.preventDefault();
                const touches = e.touches || e.changedTouches;
                if (!touches) return;

                const rect = dpadContainer.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Reset dpad directions
                this.keys['btn-left'] = false;
                this.keys['btn-right'] = false;
                this.keys['btn-up'] = false;
                this.keys['btn-down'] = false;
                
                document.getElementById('btn-left')?.classList.remove('pressed');
                document.getElementById('btn-right')?.classList.remove('pressed');
                document.getElementById('btn-up')?.classList.remove('pressed');
                document.getElementById('btn-down')?.classList.remove('pressed');

                for (let i = 0; i < touches.length; i++) {
                    const touch = touches[i];
                    const dx = touch.clientX - centerX;
                    const dy = touch.clientY - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // If inside D-pad radius (within 75px)
                    if (dist < 75 && dist > 10) {
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

                        // Right: -45 to 45
                        if (angle >= -45 && angle <= 45) {
                            this.keys['btn-right'] = true;
                            document.getElementById('btn-right')?.classList.add('pressed');
                        }
                        // Left: > 135 or < -135
                        else if (angle >= 135 || angle <= -135) {
                            this.keys['btn-left'] = true;
                            document.getElementById('btn-left')?.classList.add('pressed');
                        }
                        // Up: -135 to -45
                        else if (angle > -135 && angle < -45) {
                            this.keys['btn-up'] = true;
                            document.getElementById('btn-up')?.classList.add('pressed');
                        }
                        // Down: 45 to 135
                        else if (angle > 45 && angle < 135) {
                            this.keys['btn-down'] = true;
                            document.getElementById('btn-down')?.classList.add('pressed');
                        }
                    }
                }
            };

            const resetDpad = (e) => {
                this.keys['btn-left'] = false;
                this.keys['btn-right'] = false;
                this.keys['btn-up'] = false;
                this.keys['btn-down'] = false;
                document.getElementById('btn-left')?.classList.remove('pressed');
                document.getElementById('btn-right')?.classList.remove('pressed');
                document.getElementById('btn-up')?.classList.remove('pressed');
                document.getElementById('btn-down')?.classList.remove('pressed');
            };

            dpadContainer.addEventListener('touchstart', handleDpadTouch, { passive: false });
            dpadContainer.addEventListener('touchmove', handleDpadTouch, { passive: false });
            dpadContainer.addEventListener('touchend', resetDpad, { passive: false });
            dpadContainer.addEventListener('touchcancel', resetDpad, { passive: false });
        }
    }

    throwChinelo() {
        if (this.player.ammo > 0) {
            this.player.ammo--;
            this.projectiles.push(new Projectile(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height/2,
                this.player.facing
            ));
            this.sounds.playThrow();
            this.syncHUD();
        }
    }

    hideAllScreens() {
        document.getElementById('screen-menu').classList.add('hidden');
        document.getElementById('screen-instructions').classList.add('hidden');
        document.getElementById('screen-gameover').classList.add('hidden');
        document.getElementById('screen-victory').classList.add('hidden');
        document.getElementById('screen-paused').classList.add('hidden');
    }

    syncHUD() {
        // Vidas HUD Sync
        const liverContainer = document.getElementById('hud-liver');
        if (liverContainer) {
            let glassesHTML = '';
            for (let i = 0; i < 3; i++) {
                if (i < this.player.lives) {
                    glassesHTML += '<span class="liver-glass">🍺</span>';
                } else {
                    glassesHTML += '<span class="liver-glass empty">🍺</span>';
                }
            }
            liverContainer.innerHTML = glassesHTML;
        }

        // Score Sync
        const scoreVal = document.getElementById('hud-score');
        if (scoreVal) {
            scoreVal.innerText = `R$ ${this.player.score.toFixed(2)}`;
        }

        // Drunk Meter Sync
        const drunkBar = document.getElementById('hud-drunk-bar');
        const drunkStatus = document.getElementById('hud-drunk-status');
        if (drunkBar) {
            drunkBar.style.width = `${this.player.drunkLevel}%`;
            
            // Text status label
            if (this.player.drunkLevel > 80) {
                drunkStatus.innerText = "PT (Perda Total! 🤪)";
                drunkBar.style.background = 'var(--neon-red)';
            } else if (this.player.drunkLevel > 50) {
                drunkStatus.innerText = "Altíssimo (Louco! 🥴)";
                drunkBar.style.background = 'var(--neon-orange)';
            } else if (this.player.drunkLevel > 20) {
                drunkStatus.innerText = "Grau (Alegre! 😎)";
                drunkBar.style.background = 'var(--neon-yellow)';
            } else {
                drunkStatus.innerText = "Sóbrio (Sem graça 😐)";
                drunkBar.style.background = 'var(--neon-green)';
            }
        }

        // Ammunition
        const ammoVal = document.getElementById('hud-ammo');
        if (ammoVal) {
            ammoVal.innerText = `🩴 x${this.player.ammo}`;
        }
        
        // Random trivia jokes!
        if (Math.random() < 0.05) {
            const jokes = [
                "Fiado só amanhã! O Seu Manuel está de olho...",
                "Vira-lata caramelo detectado! Não corra!",
                "Coxinha quente de estufa recupera o fígado!",
                "Corote azul te dá asas e desequilíbrio!",
                "Pegue seu chinelo de volta no bumerangue!",
                "Não irrite o Seu Manuel, a vassoura dele dói!"
            ];
            document.getElementById('joke-text').innerText = `"${jokes[Math.floor(Math.random() * jokes.length)]}"`;
        }
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        this.sounds.playGameOver();
        this.hideAllScreens();
        
        document.getElementById('final-score').innerText = `R$ ${this.player.score.toFixed(2)}`;
        document.getElementById('screen-gameover').classList.remove('hidden');
        
        this.saveHighScore("Sr. Longuinho", this.player.score);
    }

    triggerVictory() {
        this.state = 'VICTORY';
        this.sounds.playVictory();
        this.hideAllScreens();
        
        // Final score addition for remaining lives & low drunkenness
        const lifeBonus = this.player.lives * 150;
        this.player.score += lifeBonus;
        
        document.getElementById('victory-score').innerText = `R$ ${this.player.score.toFixed(2)}`;
        document.getElementById('screen-victory').classList.remove('hidden');
        
        // Confetti burst particles
        for (let i = 0; i < 40; i++) {
            this.particles.push(new Particle(400, 200, 'confetti'));
        }
        
        this.saveHighScore("Sr. Longuinho", this.player.score);
    }

    saveHighScore(defaultName, score) {
        if (score <= 0) return;
        
        // prompt for nickname
        const name = prompt("Você quebrou a banca do Seu Manuel! Digite seu nome de boêmio:", defaultName) || defaultName;
        this.highScores.push({ name: name.substring(0, 15), score: Math.round(score) });
        
        // Sort and slice top 5
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5);
        
        localStorage.setItem('longuinhoHighScores', JSON.stringify(this.highScores));
        this.renderHighScores();
    }

    renderHighScores() {
        const scoreList = document.getElementById('high-score-list');
        if (scoreList) {
            scoreList.innerHTML = this.highScores.map((s, idx) => `
                <li>
                    <span>${idx + 1}. ${s.name}</span>
                    <span class="neon-yellow">R$ ${s.score}</span>
                </li>
            `).join('');
        }
    }

    // ==========================================================================
    // CORE GAME UPDATE & COLLISION CHECKING LOOP
    // ==========================================================================
    update() {
        if (this.state === 'MAP') {
            this.worldMap.update(this.keys);
            return;
        }

        if (this.state !== 'PLAYING') return;

        // Stage clear celebration countdown returning to map or victory
        if (this.stageClearTimer > 0) {
            this.stageClearTimer--;
            if (this.stageClearTimer === 0) {
                if (this.level >= this.maxLevel) {
                    this.triggerVictory();
                } else {
                    this.state = 'MAP';
                    this.syncHUD();
                }
            }
            // Continue updating particles during celebration
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.update();
                if (p.life <= 0) this.particles.splice(i, 1);
            }
            return;
        }

        // Screen Shake calculation
        if (this.shakeTime > 0) this.shakeTime--;

        // Update Sr. Longuinho / Player
        this.player.update(this.platforms, this.keys);
        
        // Adjust Camera scrolling viewport follow player
        if (this.level === 4) {
            // Contained Boss Arena camera (Mercadinho Talismã)
            this.cameraX = 300;
            // Bound player within arena
            if (this.player.x < 150) this.player.x = 150;
            if (this.player.x > 1250) this.player.x = 1250;
        } else {
            this.cameraX = this.player.x - 300;
            if (this.cameraX < 0) this.cameraX = 0;
            if (this.cameraX > this.levelWidth - 800) this.cameraX = this.levelWidth - 800;
        }

        // Check Victory check line (Levels 1 to 3)
        if (this.level < 4 && this.player.x >= this.goalX && this.stageClearTimer === 0) {
            this.sounds.playVictory();
            this.worldMap.clearLevel(this.level);
            this.stageClearTimer = 130; // ~2 seconds celebration before returning to map
            this.player.score += 200;
            for (let i = 0; i < 35; i++) {
                this.particles.push(new Particle(this.player.x, this.player.y - 20, 'star'));
            }
            this.syncHUD();
            return;
        }

        // Update Projectiles (Chinelos)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            const isCaught = proj.update(this.player);
            if (isCaught) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Hit box detection against enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                // Overlap AABB check
                if (proj.x + proj.width > enemy.x && proj.x < enemy.x + enemy.width &&
                    proj.y + proj.height > enemy.y && proj.y < enemy.y + enemy.height) {
                    
                    // Hit!
                    enemy.health--;
                    if (enemy.type === 'dona_fila') {
                        this.sounds.playBossHit();
                        this.triggerScreenShake(10);
                    } else {
                        this.sounds.playHit();
                        this.triggerScreenShake(6);
                    }
                    
                    // Star particles
                    for (let p = 0; p < 6; p++) {
                        this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'star'));
                    }
                    
                    // Bounce flip-flop back
                    proj.isReturning = true;
                    
                    if (enemy.health <= 0) {
                        // Kill enemy!
                        if (enemy.type === 'dona_fila') {
                            this.player.score += 500;
                            this.bossDefeated = true;
                            this.sounds.playVictory();
                            this.worldMap.clearLevel(4);
                            this.stageClearTimer = 150;
                            for (let p = 0; p < 60; p++) {
                                this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'confetti'));
                            }
                        } else {
                            const enemyPts = {
                                'caramelo': 40,
                                'mendigo': 80,
                                'noiado': 70,
                                'motoqueiro': 120
                            }[enemy.type] || 50;
                            this.player.score += enemyPts;
                        }
                        this.enemies.splice(j, 1);
                        this.syncHUD();
                    }
                    break;
                }
            }
        }

        // Update Enemy Lobs (tin cans/mugs/receipts/smoke)
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const ep = this.enemyProjectiles[i];
            const isFallen = ep.update();
            if (isFallen) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            // Player hit check
            if (ep.x + ep.width > this.player.x && ep.x < this.player.x + this.player.width &&
                ep.y + ep.height > this.player.y && ep.y < this.player.y + this.player.height) {
                
                // Damage Player
                this.player.takeDamage();
                this.enemyProjectiles.splice(i, 1);
            }
        }

        // Update Enemies patrolling
        this.enemies.forEach(enemy => {
            enemy.update(this.platforms, this.player);
            
            // Check direct body crash collision with Player
            if (enemy.x + enemy.width > this.player.x && enemy.x < this.player.x + this.player.width &&
                enemy.y + enemy.height > this.player.y && enemy.y < this.player.y + this.player.height) {
                
                if (this.player.isDashing) {
                    if (enemy.type === 'dona_fila') {
                        // Boss fight: dashing damages Dona Fila by 1 and bounces player back
                        enemy.health--;
                        this.sounds.playBossHit();
                        this.triggerScreenShake(12);
                        this.player.vx = -this.player.facing * 9;
                        this.player.vy = -3;
                        for (let p = 0; p < 8; p++) {
                            this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'star'));
                        }
                        if (enemy.health <= 0) {
                            this.player.score += 500;
                            this.bossDefeated = true;
                            this.sounds.playVictory();
                            this.worldMap.clearLevel(4);
                            this.stageClearTimer = 150;
                            for (let p = 0; p < 60; p++) {
                                this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'confetti'));
                            }
                            const idx = this.enemies.indexOf(enemy);
                            if (idx > -1) this.enemies.splice(idx, 1);
                        }
                        this.syncHUD();
                    } else {
                        // Dashing makes player invincibly strike/crush regular enemies!
                        enemy.health = 0;
                        const enemyPts = {
                            'caramelo': 40,
                            'mendigo': 80,
                            'noiado': 70,
                            'motoqueiro': 120
                        }[enemy.type] || 50;
                        this.player.score += enemyPts;
                        this.sounds.playHit();
                        this.triggerScreenShake(8);
                        
                        for (let p = 0; p < 8; p++) {
                            this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'star'));
                        }
                        
                        const idx = this.enemies.indexOf(enemy);
                        if (idx > -1) this.enemies.splice(idx, 1);
                        this.syncHUD();
                    }
                } else {
                    // Regular damage
                    this.player.takeDamage();
                }
            }
        });

        // Update Items collection
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();
            
            if (this.player.x + this.player.width > item.x && this.player.x < item.x + item.width &&
                this.player.y + this.player.height > item.y && this.player.y < item.y + item.height) {
                
                // Item collected!
                if (item.type === 'cerveja' || item.type === 'corote') {
                    this.player.drinkAlcohol(item.type);
                } else if (item.type === 'coxinha') {
                    this.player.eatCoxinha();
                } else if (item.type === 'chinelo') {
                    this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 2);
                    this.sounds.playCoxinha();
                    this.syncHUD();
                }
                
                this.items.splice(i, 1);
            }
        }

        // Update Particles VFX
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // ==========================================================================
    // MERCADINHO TALISMÃ BACKGROUND FACADE (LEVEL 4)
    // ==========================================================================
    drawMercadinhoTalisma(ctx) {
        ctx.save();
        
        // Mercadinho Talismã Building Facade (X: 380 to 1020, Y: 130 to 420)
        const bx = 380, by = 130, bw = 640, bh = 290;

        // Wall background - mint green painted plaster with wear
        ctx.fillStyle = '#1e3d2f';
        ctx.fillRect(bx, by, bw, bh);

        // Brick texture hints
        ctx.fillStyle = '#264a3a';
        for (let y = by + 50; y < by + bh; y += 22) {
            for (let x = bx + 10; x < bx + bw - 10; x += 45) {
                if ((x + y) % 90 === 0) {
                    ctx.fillRect(x, y, 38, 16);
                }
            }
        }

        // Toldo (Awning) - Striped Green and Yellow with wavy scallop edge
        const awningY = by + 28;
        const awningH = 34;
        const stripeW = 20;
        for (let i = 0; i < bw; i += stripeW) {
            ctx.fillStyle = (Math.floor(i / stripeW) % 2 === 0) ? '#ffcc00' : '#1b5e20';
            ctx.fillRect(bx + i, awningY, stripeW, awningH);
            // Awning scallops
            ctx.beginPath();
            ctx.arc(bx + i + stripeW / 2, awningY + awningH, stripeW / 2, 0, Math.PI);
            ctx.fill();
        }

        // Main Sign Board above awning
        ctx.fillStyle = '#0f2619';
        ctx.fillRect(bx + 40, by - 10, bw - 80, 36);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 40, by - 10, bw - 80, 36);

        ctx.fillStyle = '#ffd700';
        ctx.font = "bold 13px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffd700';
        ctx.fillText("MERCADINHO TALISMÃ", bx + bw / 2, by + 14);
        ctxDisableShadow(ctx);

        // Subtitle sign under awning: "FIADO SÓ AMANHÃ! NÃO INSISTA!"
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(bx + 120, awningY + awningH + 12, bw - 240, 20);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 120, awningY + awningH + 12, bw - 240, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 8px 'Press Start 2P', monospace";
        ctx.fillText("★ FIADO SÓ AMANHÃ! NÃO INSISTA! ★", bx + bw / 2, awningY + awningH + 26);

        // Store Windows with products
        // Left Window (Shelves of Cachaça / Bebidas)
        ctx.fillStyle = '#122019';
        ctx.fillRect(bx + 40, by + 110, 160, 130);
        ctx.strokeStyle = '#3d614e';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 40, by + 110, 160, 130);

        // Shelf lines and bottles
        for (let sy = by + 145; sy < by + 230; sy += 35) {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 44, sy, 152, 6); // shelf wood
            // bottles on shelf
            for (let bxPos = bx + 50; bxPos < bx + 185; bxPos += 16) {
                const bCol = (bxPos % 3 === 0) ? '#2e7d32' : ((bxPos % 2 === 0) ? '#0288d1' : '#f57f17');
                ctx.fillStyle = bCol;
                ctx.fillRect(bxPos, sy - 18, 10, 18);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bxPos + 3, sy - 22, 4, 5); // bottle neck
            }
        }

        // Store Entrance / Rolling gate in center
        ctx.fillStyle = '#0a140f';
        ctx.fillRect(bx + 230, by + 110, 180, 180);
        // Beaded plastic door curtain
        for (let cx = bx + 235; cx < bx + 405; cx += 8) {
            ctx.strokeStyle = (cx % 16 === 0) ? '#ffcc00' : '#4caf50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, by + 110);
            ctx.lineTo(cx, by + 290);
            ctx.stroke();
        }

        // Right Window (Salgadinhos / Mercearia)
        ctx.fillStyle = '#122019';
        ctx.fillRect(bx + 440, by + 110, 160, 130);
        ctx.strokeStyle = '#3d614e';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 440, by + 110, 160, 130);
        for (let sy = by + 145; sy < by + 230; sy += 35) {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 444, sy, 152, 6);
            // snacks & chips
            for (let bxPos = bx + 450; bxPos < bx + 585; bxPos += 18) {
                const sCol = (bxPos % 3 === 0) ? '#e53935' : ((bxPos % 2 === 0) ? '#fbc02d' : '#8e24aa');
                ctx.fillStyle = sCol;
                ctx.fillRect(bxPos, sy - 16, 13, 16);
            }
        }

        // Stacked yellow beer crates (Brahma/Skol) on sidewalk
        const drawBeerCrate = (cx, cy) => {
            ctx.fillStyle = '#fbc02d'; // yellow plastic crate
            ctx.fillRect(cx, cy, 32, 22);
            ctx.strokeStyle = '#e65100';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, 32, 22);
            // bottle tops inside crate
            ctx.fillStyle = '#795548';
            for (let ox = 4; ox < 30; ox += 7) {
                ctx.fillRect(cx + ox, cy - 3, 4, 4);
            }
        };

        // Crates left side
        drawBeerCrate(bx - 30, by + 268);
        drawBeerCrate(bx - 30, by + 246);
        drawBeerCrate(bx + 4,  by + 268);

        // Crates right side
        drawBeerCrate(bx + bw + 5, by + 268);
        drawBeerCrate(bx + bw + 5, by + 246);
        drawBeerCrate(bx + bw - 30, by + 268);

        // Chalkboard sign on sidewalk
        ctx.fillStyle = '#1c1524';
        ctx.fillRect(bx + 200, by + 235, 26, 45);
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 200, by + 235, 26, 45);
        ctx.fillStyle = '#ffffff';
        ctx.font = "6px sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText("COROTE", bx + 213, by + 250);
        ctx.fillStyle = '#ffeb3b';
        ctx.fillText("R$ 2,50", bx + 213, by + 265);

        ctx.restore();
    }

    // ==========================================================================
    // PARALLAX LAYERED DRAWING (GRAPHICS RENDERER)
    // ==========================================================================
    draw() {
        if (this.state === 'MAP') {
            this.worldMap.draw(this.ctx);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        
        // Screen shake offsets translation
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        // ----------------------------------------------------
        // LAYER 1: BACK SKY & NEON STARS (Static/Infinite)
        // ----------------------------------------------------
        this.ctx.fillStyle = '#0a0614';
        this.ctx.fillRect(0, 0, 800, 480);
        
        // Draw moon
        this.ctx.fillStyle = '#1e1430';
        this.ctx.beginPath();
        this.ctx.arc(680, 80, 45, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ff8f00'; // neon orange moon shadow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(255, 143, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(670, 75, 42, 0, Math.PI * 2);
        this.ctx.fill();
        ctxDisableShadow(this.ctx);

        // ----------------------------------------------------
        // LAYER 2: PARALLAX - FAVELA / HILL SKYLINE (Slow scroll)
        // ----------------------------------------------------
        this.ctx.save();
        this.ctx.translate(-this.cameraX * 0.15, 0);
        this.ctx.fillStyle = '#170f2a';
        // Favela silhouette layers (stacked square houses on hills)
        for (let i = 0; i < 4000; i += 80) {
            const hillHeight = 120 + Math.sin(i / 180) * 40;
            this.ctx.fillRect(i, 420 - hillHeight, 70, hillHeight);
            
            // Random tiny yellow grid windows in background favela
            this.ctx.fillStyle = '#ffee55';
            if (i % 3 === 0) this.ctx.fillRect(i + 15, 420 - hillHeight + 10, 3, 3);
            if (i % 5 === 0) this.ctx.fillRect(i + 45, 420 - hillHeight + 35, 3, 3);
            this.ctx.fillStyle = '#170f2a';
        }
        this.ctx.restore();

        // ----------------------------------------------------
        // LAYER 3: PARALLAX - CITY LIGHTS & WIRES (Medium scroll)
        // ----------------------------------------------------
        this.ctx.save();
        this.ctx.translate(-this.cameraX * 0.4, 0);
        
        // Hanging high-voltage wires
        this.ctx.strokeStyle = '#281c44';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 4000; i += 300) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 100);
            this.ctx.bezierCurveTo(i + 100, 150, i + 200, 150, i + 300, 100);
            this.ctx.stroke();
            
            // Sneakers hanging on wire
            if (i % 900 === 0) {
                this.ctx.fillStyle = '#ff3366';
                this.ctx.fillRect(i + 150, 138, 8, 5);
                this.ctx.fillRect(i + 154, 142, 8, 5);
            }
        }
        
        // Street bar neon light poles
        for (let i = 200; i < 4000; i += 700) {
            this.ctx.fillStyle = '#21153b';
            this.ctx.fillRect(i, 200, 8, 220); // pole
            // Glowing neon lantern
            this.ctx.fillStyle = '#00ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.beginPath();
            this.ctx.arc(i + 4, 200, 7, 0, Math.PI * 2);
            this.ctx.fill();
            ctxDisableShadow(this.ctx);
        }
        this.ctx.restore();

        // ----------------------------------------------------
        // LAYER 4: ACTIVE PLATFORMS & ENTITIES LAYER (Main scroll)
        // ----------------------------------------------------
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // If Level 4: Draw Mercadinho Talismã facade background!
        if (this.level === 4) {
            this.drawMercadinhoTalisma(this.ctx);
        } else {
            // Draw goal banner (Lendário Boteco do Seu Manuel)
            this.ctx.save();
            this.ctx.translate(this.goalX, 150);
            this.ctx.fillStyle = '#1c152a';
            this.ctx.fillRect(0, 0, 200, 100);
            this.ctx.strokeStyle = 'var(--neon-green)';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'var(--neon-green-glow)';
            this.ctx.strokeRect(0, 0, 200, 100);
            this.ctx.fillStyle = 'var(--neon-green)';
            this.ctx.font = "11px 'Press Start 2P'";
            this.ctx.fillText("BOTECO", 60, 40);
            this.ctx.fillText("LENDARIO", 45, 70);
            ctxDisableShadow(this.ctx);
            this.ctx.fillStyle = '#2c253d';
            this.ctx.fillRect(20, 100, 15, 200);
            this.ctx.fillRect(165, 100, 15, 200);
            this.ctx.restore();
        }

        // Draw Platforms
        this.platforms.forEach(plat => plat.draw(this.ctx));

        // Draw Collectible Items
        this.items.forEach(item => item.draw(this.ctx));

        // Draw Enemies patrolling
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw projectiles (Chinelo / Flip-Flops)
        this.projectiles.forEach(proj => proj.draw(this.ctx));
        
        // Draw Enemy projectiles
        this.enemyProjectiles.forEach(ep => ep.draw(this.ctx));

        // Draw Player Sr. Longuinho
        this.player.draw(this.ctx);

        // Draw VFX Particles
        this.particles.forEach(p => p.draw(this.ctx));

        this.ctx.restore(); // end game scrolling translate
        
        // ----------------------------------------------------
        // LAYER 5: STATIC HUD OVERLAYS ON CANVAS
        // ----------------------------------------------------
        
        // Wobble drunk overlay filter!
        if (this.player.drunkLevel > 40) {
            this.ctx.save();
            const wobbleOpacity = (this.player.drunkLevel - 40) / 100 * 0.15;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${wobbleOpacity})`;
            this.ctx.fillRect(0, 0, 800, 480);
            
            // Blurry lens effect inside canvas
            this.ctx.fillStyle = `rgba(0, 255, 255, ${wobbleOpacity * 0.5})`;
            this.ctx.fillRect(Math.sin(Date.now() / 100) * 10, Math.cos(Date.now() / 100) * 10, 800, 480);
            this.ctx.restore();
        }

        // Boss Health Bar on top center (Level 4: Dona Fila)
        if (this.level === 4) {
            const donaFila = this.enemies.find(e => e.type === 'dona_fila');
            if (donaFila) {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(16, 10, 26, 0.92)';
                this.ctx.fillRect(230, 16, 340, 36);
                this.ctx.strokeStyle = '#ff4081';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(230, 16, 340, 36);

                this.ctx.fillStyle = '#ff4081';
                this.ctx.font = "bold 9px 'Press Start 2P', monospace";
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText("DONA FILA:", 242, 34);

                // Draw hearts / hit points
                for (let h = 0; h < 5; h++) {
                    if (h < donaFila.health) {
                        this.ctx.fillStyle = '#f44336';
                        this.ctx.fillText("♥", 365 + h * 26, 34);
                    } else {
                        this.ctx.fillStyle = '#555555';
                        this.ctx.fillText("♡", 365 + h * 26, 34);
                    }
                }
                this.ctx.restore();
            }
        }

        // Stage clear celebration banner
        if (this.stageClearTimer > 0) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(14, 10, 24, 0.94)';
            this.ctx.fillRect(150, 180, 500, 95);
            this.ctx.strokeStyle = 'var(--neon-green)';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(150, 180, 500, 95);

            this.ctx.fillStyle = 'var(--neon-green)';
            this.ctx.font = "bold 13px 'Press Start 2P', monospace";
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            if (this.level === 4) {
                this.ctx.fillText("★ CONTA PAGA COM SUCESSO! ★", 400, 215);
                this.ctx.fillStyle = 'var(--neon-yellow)';
                this.ctx.font = "10px 'Press Start 2P', monospace";
                this.ctx.fillText("DONA FILA RASGOU A CADERNETA!", 400, 245);
            } else {
                this.ctx.fillText("★ RUA CONCLUÍDA! ★", 400, 215);
                this.ctx.fillStyle = 'var(--neon-yellow)';
                this.ctx.font = "10px 'Press Start 2P', monospace";
                this.ctx.fillText("VOLTANDO AO MAPA...", 400, 245);
            }
            this.ctx.restore();
        }

        // Draw basic level HUD floating text inside Canvas
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = "10px 'Press Start 2P'";
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#000';
        this.ctx.fillText(`FASE: ${this.levelName || ('Fase ' + this.level)}`, 20, 30);
        if (this.level === 4) {
            this.ctx.fillText("CHEFÃO: DONA FILA (MERCADINHO)", 20, 50);
        } else {
            this.ctx.fillText(`METRO: ${Math.round(this.player.x)}m / ${this.goalX}m`, 20, 50);
        }
        this.ctx.restore();

        this.ctx.restore(); // end screen shake translate
    }
}

// Utility function to turn off shadow blur instantly
function ctxDisableShadow(ctx) {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

// ==========================================================================
// 9. ENGINE LOOP INITIALIZER
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    // Main Game Frame Loop
    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
});
