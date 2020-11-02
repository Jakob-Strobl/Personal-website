import {
    WebGLRenderer,
    RawShaderMaterial,
    Mesh,
    PerspectiveCamera,
    Scene,
    Color,
    Vector2,
    PlaneBufferGeometry
} from "./../js/lib/three.module.js";

class Waveform {
    constructor(num_waves=4) {
        this.num_waves = num_waves;
        this.wind_direction = new Vector2().random().normalize();
        this.base = new Vector2();
        this.waves = [];

        // Initialize waves
        for (let i = 0; i < num_waves; i++) {
            this.waves.push(this.createWave());
        }

        // Fading in/out waves
        this.current_wave_fading = 0;
        this.fade_coef = -1;
        this.fade_step = 100;
        this.original_amplitude = this.waves[this.current_wave_fading].amplitude;
    }

    /**
     * 
     * @param {*} frame_delta - time since last frame in seconds 
     */
    update(frame_delta) { 
        // TODO Implement 
    }

    createWave() {
        const wave = {
            direction: this.wind_direction.clone().rotateAround(this.base, (Math.PI * Math.random() * 0.25) - (Math.PI * 0.125)),
            amplitude: Math.random(),
            length: 40 * Math.random() + 10,
            speed: 10 * Math.random() + 15,
            frequency: 0.0,
            steepness: 0.4 * Math.random()
        };

        wave.speed = wave.speed * 2.0 / wave.length;
        wave.frequency = Math.sqrt( 9.8 * ( 2 * Math.PI / wave.length ) );

        return wave;
    }
}

let current_frame = 0,
    previous_frame = 0,
    frame_delta = 0;
const {
    camera,
    scene,
    renderer,
    wave_plane,
    waveform
} = init();
renderCanvas();

function init() {
    function createWavePlane() {
        // TODO Adjust plane buffer properties on screen size
        const geometry = new PlaneBufferGeometry(25, 20, 128, 128);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(0, -2, 0);

        const waveform = new Waveform(4);

        const material = new RawShaderMaterial({
            uniforms: {
                "time": { value: 1.0 },
                "sineTime": { value: 1.0 },
                "waves": { value: { ...waveform.waves } }
            },
            vertexShader: document.getElementById('waves-vs').textContent,
            fragmentShader: document.getElementById('waves-fs').textContent,
            side: 2,
            transparent: false
        })

        const mesh = new Mesh(geometry, material);
        return {
            wave_plane: mesh,
            waveform
        };
    }

    const camera = new PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 100 );
    camera.position.z = 10;
    camera.position.y = 1;
    
    const scene = new Scene();

    const renderer = new WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new Color( 0x130D20 ) );

    
    // Create Objects in Scene 
    const { wave_plane, waveform } = createWavePlane();
    scene.add(wave_plane);

    // Event Listeners
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    });

    // Append WebGL renderer to html page
    document.body.appendChild( renderer.domElement );

    return {
        camera,
        scene,
        renderer, 
        wave_plane,
        waveform
    }
}

function renderCanvas(timestamp=0) {
    requestAnimationFrame( renderCanvas );
    renderer.render(scene, camera);
    
    // Update Frame Delta
    previous_frame = current_frame;
    current_frame = timestamp;
    frame_delta = (current_frame - previous_frame);

    // console.log(frame_delta);

    // Update Scene Objects
    // waveform.update(frame_delta);

    // Update Shader Uniforms
    wave_plane.material.uniforms["time"].value = timestamp * 0.005;
    wave_plane.material.uniforms["sineTime"].value = Math.sin(timestamp * 0.00005);
    // wave_plane.material.uniforms["waves"].value = { ...waveform.waves };
}