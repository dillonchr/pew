let platforms, player, stars, score, scoreText, bombs, gameOver;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

const dropBomb = () => {
    const x = player.x < 400 ?
            Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);
        bombs.create(x, 16, 'bomb')
            .setBounce(1)
            .setCollideWorldBounds(1)
            .setVelocity(Phaser.Math.Between(-200, 200), 20);
        };

const collectStar = (player, star) => {
    star.disableBody(true, true);
    scoreText.setText(`score: ${score += 10}`);

    if (!stars.countActive(true)) {
        stars.children.iterate(c => c.enableBody(true, c.x, 0, true, true));
        dropBomb();
    }
};

function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = 1;
}

function create() {
    [
        this.add.image(0, 0, 'sky')
    ]
        .map(i => i.setOrigin(0, 0));

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground')
        .setScale(2)
        .refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude')
        .setBounce(0.2)
        .setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    });
    stars.children.iterate(c => c.setBounceY(Phaser.Math.FloatBetween(.4, .8)));

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    score = 0;
    scoreText = this.add.text(16, -200, 'score: 0', {fontSize: '32px', fill: '#000'});

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    dropBomb();
}

function update() {
    const { left, right, up } = this.input.keyboard.createCursorKeys();

    if (left.isDown) {
        player.setVelocityX(-160 << !!left.shiftKey);
        player.anims.play('left', 1);
    } else if (right.isDown) {
        player.setVelocityX(160 << !!right.shiftKey);
        player.anims.play('right', 1);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (up.isDown && player.body.touching.down) {
        player.setVelocityY(-160 - Math.abs(player.body.velocity.x));
    } else if (!up.isDown && player.body.velocity.y) {
        player.setVelocityY(player.body.velocity.y + 10);
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: 0
        }
    }
});