interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  jumpForce: number;
  groundLevel: number;
  initialLives: number;
  scoreIncrement: number;
  playerSize: number;
  languageSize: number;
}

type LanguageType = 'javascript' | 'python' | 'lua' | 'java' | 'typescript' | 'cpp' | 'rust' | 'kotlin';

interface AnimationAssets {
  playerImage: string;
  languages: Record<LanguageType, string>;
}

const CONFIG: GameConfig = {
  canvasWidth: 400,
  canvasHeight: 400,
  gravity: 0.8,
  jumpForce: -15,
  groundLevel: window.innerHeight - 50, // Adjust ground level relative to window height
  initialLives: 3,
  scoreIncrement: 100,
  // Add relative sizing for sprites
  playerSize: 64, // Player will be 10% of screen height
  languageSize: 64, // Language icons will be 8% of screen height
};

const ANIMATIONS: AnimationAssets = {
  playerImage: 'assets/player/player.png', // Single static player image
  languages: {
    javascript: 'assets/languages/javascript-sheet.png',
    python: 'assets/languages/python-sheet.png',
    lua: 'assets/languages/lua-sheet.png',
    java: 'assets/languages/java-sheet.png',
    typescript: 'assets/languages/typescript-sheet.png',
    cpp: 'assets/languages/cpp-sheet.png',
    rust: 'assets/languages/rust-sheet.png',
    kotlin: 'assets/languages/kotlin-sheet.png'
  }
};

class Player {
  public sprite: Sprite;
  public score: number;
  public lives: number;

  constructor() {
      this.sprite = new Sprite(
        CONFIG.canvasWidth * 0.1, // Position player at 10% of screen width
        CONFIG.canvasHeight / 2
      );
      this.sprite.width = CONFIG.playerSize;
      this.sprite.height = CONFIG.playerSize;
      this.sprite.img = ANIMATIONS.playerImage;
  
      this.sprite.layer = 1;
      this.sprite.collider = 'dynamic';
      this.sprite.rotationLock = true;
  
      this.score = 0;
      this.lives = CONFIG.initialLives;
    }

  update(): void {
    // Apply gravity
    this.sprite.vel.y += CONFIG.gravity;
    
    // Ground check
    if (this.sprite.y >= CONFIG.groundLevel) {
      this.sprite.y = CONFIG.groundLevel;
      this.sprite.vel.y = 0;
    }

    // Jump control
    if ((kb.presses('space') || kb.pre) && this.sprite.y >= CONFIG.groundLevel) {
      this.sprite.vel.y = CONFIG.jumpForce;
    }
  }
}

class LanguageSprite {
  public static readonly badLanguages: LanguageType[] = ['javascript', 'python', 'lua', 'java'];
  public static readonly goodLanguages: LanguageType[] = ['typescript', 'cpp', 'rust', 'kotlin'];

  public sprite: Sprite;
  private type: LanguageType;

  constructor(isGood: boolean) {
      const languages = isGood ? LanguageSprite.goodLanguages : LanguageSprite.badLanguages;
      this.type = languages[Math.floor(Math.random() * languages.length)];
  
      this.sprite = new Sprite(
        CONFIG.canvasWidth + CONFIG.languageSize, // Start just off screen
        random(CONFIG.languageSize, CONFIG.groundLevel - CONFIG.languageSize)
      );
      this.sprite.width = CONFIG.languageSize;
      this.sprite.height = CONFIG.languageSize;
      this.sprite.isGood = isGood;
      
      this.sprite.addAni('spin', ANIMATIONS.languages[this.type], { 
        frameSize: [64, 64],
        frames: 32,
        frameDelay: 2 
      });
  
      // Adjust velocity based on screen width
      this.sprite.vel.x = random(-CONFIG.canvasWidth * 0.01, -CONFIG.canvasWidth * 0.005);
      this.sprite.collider = 'dynamic';
      this.sprite.rotationLock = true;
    }

    reset(): void {
        this.sprite.x = CONFIG.canvasWidth + CONFIG.languageSize;
        this.sprite.y = random(CONFIG.languageSize, CONFIG.groundLevel - CONFIG.languageSize);
        this.sprite.vel.x = random(-CONFIG.canvasWidth * 0.01, -CONFIG.canvasWidth * 0.005);
      }
}


class Game {
  private player: Player;
  private languages: Group;
  public powerupCount: number;
  private spawnTimer: number;
  public gameOver: boolean;

  constructor() {
    this.player = new Player();
    this.languages = new Group();
    this.powerupCount = 0;
    this.spawnTimer = 0;
    this.gameOver = false;
  }

  private spawnLanguage(): LanguageSprite {
    const isGood = random() > 0.5;
    const lang = new LanguageSprite(isGood);
    this.languages.add(lang.sprite);
    return lang;
  }

  update(): void {
    if (this.gameOver) return;

    this.player.update();

    // Spawn new languages
    this.spawnTimer++;
    if (this.spawnTimer > 120) {
      this.spawnLanguage();
      this.spawnTimer = 0;
    }

    // Update languages
    for (const lang of this.languages) {
      if (lang.x < -50) {
        lang.remove();
      }

      if (lang.collides(this.player.sprite)) {
        if (lang.isGood) {
          this.player.score += CONFIG.scoreIncrement;
          this.powerupCount++;
        } else {
          this.player.lives--;
          if (this.player.lives <= 0) {
            this.gameOver = true;
          }
        }
        lang.remove();
      }
    }
  }

  draw(): void {
    background(51);

    // Draw HUD
    this.drawHUD();
  }

  private drawHUD(): void {
    fill(255);
    textSize(20);
    textAlign(LEFT);
    text(`Score: ${this.player.score}`, 20, 30);
    text(`Lives: ${this.player.lives}`, 20, 60);
    text(`Powerups: ${this.powerupCount}`, 20, 90);

    if (this.gameOver) {
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text('Game Over!', CONFIG.canvasWidth/2, CONFIG.canvasHeight/2);
    }
  }
}

let game: Game;

function setup() {
  createCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
  game = new Game();

  // Initial language spawns
  for (let i = 0; i < 3; i++) {
    game['spawnLanguage']();
  }
}

function draw() {
  game.update();
  game.draw();
}
