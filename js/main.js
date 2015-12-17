window.createGame = function(scope, entities, mapId, injector) {
    scope.$on('game:addEntities', function(data) {
        stars = game.add.group();
        stars.enableBody = true;
        dirs = game.add.group();
        dirs.enableBody = true;
        for (var i = 0; i < Object.keys(data.targetScope.entries).length; i++)
        {
            if (data.targetScope.entries[i]['.tag'] == 'file') {
                extension = data.targetScope.entries[i]['path_lower'].substring(data.targetScope.entries[i]['path_lower'].length-3)
                switch (extension) {
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        var item = stars.create(70 + i * 70, 0, 'picture');
                        break;
                    case 'mp3':
                        var item = stars.create(70 + i * 70, 0, 'note');
                        break;
                    default:
                        var item = stars.create(70 + i * 70, 0, 'text');
                }
            } else {
                var item = dirs.create(70 + i * 70, 0, 'folder');
            }
            item.body.gravity.y = 300;
            item.body.bounce.y = 0.2 + Math.random() * 0.2;
            item.name = data.targetScope.entries[i]['name'];
            item.path_lower = data.targetScope.entries[i]['path_lower'];
            item.tag = data.targetScope.entries[i]['.tag'];
        }
        game.world.setBounds(0,0, Object.keys(data.targetScope.entries).length*70 + 140, 600);
    });

    scope.$on('$destroy', function() {
        game.destroy();
    });

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', { preload: preload, create: create, update: update });

    function preload() {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('folder', 'assets/FolderW.png');
        game.load.image('text', 'assets/Text.png');
        game.load.image('note', 'assets/Note.png');
        game.load.image('picture', 'assets/Picture.png');
        game.load.image('speech', 'assets/speech.svg');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    }

    var player;
    var platforms;
    var cursors;
    var stars;
    var dirs;
    var preview = '';
    var score = 0;
    var scoreText;

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 1920, 600);
        game.add.sprite(0, 0, 'sky');
        game.add.sprite(800, 0, 'sky');
        game.add.sprite(1600, 0, 'sky');
        platforms = game.add.group();
        platforms.enableBody = true;
        var ground = platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(8, 2);
        ground.body.immovable = true;
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;
        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;
        player = game.add.sprite(32, game.world.height - 150, 'dude');
        game.physics.arcade.enable(player);
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#fff' });
        scoreText.fixedToCamera = true;
        scoreText.cameraOffset.setTo(16, 16);
        cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        game.camera.deadzone = new Phaser.Rectangle(100, 100, 600, 400);
    }

    var onLoaded = function(){
        console.log('everything is loaded and ready to be used');
        speech = game.add.sprite(player.x-72, player.y-190,'speech');
        preview = game.add.sprite(player.x-58, player.y-168,'preview');
        speech.scale.setTo(0.25,0.45);
    }

    function update() {
        scoreText.text = '';
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(stars, platforms);
        game.physics.arcade.collide(dirs, platforms);
        game.physics.arcade.overlap(player, stars, collectItem, null, this);
        game.physics.arcade.overlap(player, dirs, collectItem, null, this);
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
            player.animations.play('left');
            if (preview != '') {
                preview.kill();
                preview = '';
                speech.kill();
                speech = '';
                scope.imgSrc = '';
            }
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
            player.animations.play('right');
            if (preview != '') {
                preview.kill();
                preview = '';
                speech.kill();
                speech = '';
                scope.imgSrc = '';
            }
        }
        else
        {
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -350;
            if (preview && speech) {
                preview.kill();
                preview = '';
                speech.kill();
                speech = '';
                scope.imgSrc = '';
            }
        }

        if (preview != '' && scope.imgSrc == '') {
            preview.kill();
            preview = '';
            speech.kill();
            speech = '';
        }

    }

    function collectItem (player, item) {
        scoreText.text = 'You are looking at ' + item.name;

        if (cursors.down.isDown)
        {
            if (!scope.loading) {
                console.log(score);
                if (item.tag == 'folder') {
                    scope.browsePath(item.path_lower);
                } else {
                    console.log(scope.imgSrc);
                    scope.preview(item.path_lower)
                }
            }
        }
        if (scope.imgSrc != '' && preview == '') {
            console.log('Loading BLOB preview ' + scope.imgSrc);
            loader = new Phaser.Loader(game);
            loader.image('preview', scope.imgSrc );
            loader.onLoadComplete.addOnce(onLoaded);
            loader.start();
        }
    }
};