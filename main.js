var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 300,
      },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
};

var player;
var coins;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "img/sky.png");
  this.load.image("ground", "img/platform.png");
  this.load.image("coin", "img/coin.png");
  this.load.image("bomb", "img/bomb.png");
  this.load.spritesheet("dude", "img/dude.png", {
    frameWidth: 32,
    frameHeight: 42,
  });
  this.load.audio("coinsound", "sounds/coin.mp3");
  this.load.image("gameover", "img/gameover.png");
  this.load.audio("gameoversound", "sounds/gameover.mp3");
  this.load.image('replaybutton', 'img/replay.png');
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  this.coinSound = this.sound.add("coinsound");
  this.gameOverSound = this.sound.add("gameoversound");

  player = this.physics.add.sprite(100, 508, "dude");

  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [
      {
        key: "dude",
        frame: 4,
      },
    ],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 5,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  coins = this.physics.add.group({
    key: "coin",
    repeat: 11,
    setXY: {
      x: 12,
      y: 0,
      stepX: 70,
    },
  });

  coins.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
  });

  bombs = this.physics.add.group();

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontFamily: "Verdana",
    fontSize: "20px",
    color: "white",
    resolution: 2,
  });

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(coins, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.overlap(player, coins, collectCoin, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (gameOver) {
    this.add.image(400, 150, "gameover");
    this.replayButton = this.add.image(400, 300, "replaybutton").setInteractive();

    this.replayButton.on('pointerdown', () => {
      gameOver = false;
      score = 0;
      this.scene.restart();
    })
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectCoin(player, coin) {
  coin.disableBody(true, true);

  this.coinSound.play();
  this.coinSound.setVolume(0.2);

  score += 5;
  scoreText.setText("Score: " + score);

  if (coins.countActive(true) === 0) {
    coins.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 20, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = true;
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;

  this.gameOverSound.play();
  this.gameOverSound.setVolume(0.5);
}
