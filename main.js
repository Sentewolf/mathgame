var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: {
		preload: preload,
		create: create,
        update: update
	}
};

var game = new Phaser.Game(config);
var target;
var solution;
var tween_display_text;
var emitter;
var particles;
var score=0;
var speed=50;

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('red', 'assets/star.png');
    this.load.image('star', 'assets/star.png');
}

function create ()
{
	this.add.image(400, 300, 'sky');
	particles = this.add.particles('red');

	emitter = particles.createEmitter({
        active: false,
		speed: 300,
        maxParticles: 20,
		scale: { start: 1, end: 0 },
		blendMode: 'ADD',
        gravityY: 256,
	});

    target = this.physics.add.image(300, 60, 'star');
    target.setVisible(false);
    target.body.setAllowGravity(false);
	target.setVelocity(0, speed);

    solution = "2";
    target_text = this.add.text(0, 0, "1 + 1", { fontSize: '32px', fill: '#000' });
    target_text.setOrigin(0.5, 0.5);
    target_text.x = target.x;
    target_text.y = target.y;

    display_text = this.add.text(400, 550, '', { fontSize: '32px', fill: '#000' });
    display_text.setOrigin(0.5, 0);
    tween_display_text = this.tweens.add({
        targets: display_text,
        alpha: { from: 1, to: 0 },
        ease: 'Sine.InOut',
        duration: 1000,
        repeat: 0,
    })

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    input_text = "";
    this.input.keyboard.on('keyup', function anyKey (event)
    {
        input_text += event.key;
        check_string();
    }
    , this);
}

function check_string ()
{
    if (input_text==solution)
    {
        score+=1;

        speed+=(600 - target.y) / 120;
        
        emitter.remove();
        emitter = particles.createEmitter({
            speed: 300,
            maxParticles: 20,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            gravityY: 256,
        });
        emitter.setPosition(target.x, target.y);
        display_text.setText(input_text);
        display_text.setFill("#050");
        tween_display_text.restart();
        new_task();
        return;
    }
    display_text.setText(input_text);
    if (!solution.startsWith(input_text))
    {
        tween_display_text.play();
        display_text.setFill("#F00");
        input_text="";
    }
    else
    {
        tween_display_text.restart();
        tween_display_text.stop();
        display_text.setFill("#000");
    }
}

function task_value (limit=10)
{
    v1 = Phaser.Math.Between(1, limit-1)
    target_text.setText(v1)
    solution = v1.toString();
}


function task_sum_singledigit (limit=10, sorted=true)
{
    v3 = Phaser.Math.Between(2, Math.min(18, limit));
    v1 = Phaser.Math.Between(Math.max(1, v3-9), Math.min(v3-1, 9));
    v2 = v3 - v1

    if (sorted && v2>v1)
    {
        v4 = v1;
        v1 = v2;
        v2 = v4;
    }
    target_text.setText(v1 + " + " + v2);
    solution = v3.toString();
}


function task_sum (limit=10, sorted=true)
{
    v3 = Phaser.Math.Between(2, limit);
    v1 = Phaser.Math.Between(1, v3-1);
    v2 = v3 - v1

    if (sorted && v2>v1) {
        v4 = v1;
        v1 = v2;
        v2 = v4;
    }

    target_text.setText(v1 + " + " + v2);
    solution = v3.toString();
}

function task_sum_ten (sorted=true)
{
    v3 = 10;
    v1 = Phaser.Math.Between(1, v3-1);
    v2 = v3 - v1

    if (sorted && v2>v1) {
        v4 = v1;
        v1 = v2;
        v2 = v4;
    }

    target_text.setText(v1 + " + " + v2);
    solution = v3.toString();
}



function new_task ()
{
    input_text = "";

    target.y = 0;
    target.x = Phaser.Math.Between(50, 750);

    n_tasks = 5

    probabilities = [];
    sum = 0;
    for (i = 0; i < n_tasks; i++) {
        value = Math.exp(-0.5 * Math.pow((speed - i * 80) / (50), 2));
        sum += value;
        probabilities[i] = value;
    }
    
    randval = Phaser.Math.FloatBetween(0, sum)

    task_index = 0;
    sum = probabilities[task_index];
    while (sum<=randval && task_index<n_tasks-1) {
        task_index+=1
        sum += probabilities[task_index]
    }

    switch(task_index) {
        case 0:
            task_value(limit=10);
            break;
        case 1:
            task_value(limit=100);
            break;
        case 3:
            task_sum_ten();
            break;
        case 4:
            task_sum_singledigit(limit=12);
            break;
        case 5:
            task_sum(limit=20, sorted=true);
            break;
        case 6:
            task_sum_singledigit(limit=12, sorted=false);
            break;
        case 7:
            task_sum(limit=20, sorted=false);
            break;
    }

    target.setVelocity(0, speed / (1 + 0.5*task_index));
}

function update (time, delta)
{
    scoreText.setText(Math.round(speed));

    target_text.x = target.x;
    target_text.y = target.y;

    if (target.y > 600)
    {
        speed*=.95;
        new_task();
    }
}