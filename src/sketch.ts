const debugRef = document.createElement('div');
const debugText = new Array<string>();
document.body.appendChild(debugRef);
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
  groundLevel: 390,
  initialLives: 3,
  scoreIncrement: 100,
  playerSize: 64,
  languageSize: 64
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
        CONFIG.canvasWidth * 0.1,
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
    if ((kb.presses('space') || kb.presses("up")) && this.sprite.y >= CONFIG.groundLevel) {
      this.sprite.vel.y = CONFIG.jumpForce;
    }
  }
}

class LanguageSprite {
  public static readonly badLanguages: LanguageType[] = ['javascript', 'python', 'lua', 'java'];
  public static readonly goodLanguages: LanguageType[] = ['typescript', 'cpp', 'rust', 'kotlin'];

  public sprite: Sprite;
  private type: LanguageType;
  private speed: number;

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
      this.speed = random(-CONFIG.canvasWidth * 0.01, -CONFIG.canvasWidth * 0.005);
      // Adjust velocity based on screen width
      this.sprite.collider = 'static';
      this.sprite.rotationLock = true;
    }
    update(): void {
      this.sprite.x += this.speed;
    }
    reset(): void {
      this.sprite.x = CONFIG.canvasWidth + CONFIG.languageSize;
      this.sprite.y = random(CONFIG.languageSize, CONFIG.groundLevel - CONFIG.languageSize);
      this.speed = random(-CONFIG.canvasWidth * 0.01, -CONFIG.canvasWidth * 0.005);
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
  public getPlayer(): Player {
      return this.player;
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
      lang.update();
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
  debugText.length = 0;
  debugText.push(
    `FPS: ${frameRate().toFixed(2)}`,
    `Game over: ${game.gameOver}`,
    `Player Position: (${game.getPlayer().sprite.x.toFixed(2)}, ${game.getPlayer().sprite.y.toFixed(2)})`,
    `Player Velocity: (${game.getPlayer().sprite.vel.x.toFixed(2)}, ${game.getPlayer().sprite.vel.y.toFixed(2)})`
  )
  debugRef.innerHTML = debugText.join('<br>');
}
