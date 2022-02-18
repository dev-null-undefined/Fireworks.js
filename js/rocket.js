const max_speed = 4;
const min_speed = 1;
const default_alpha = 0.8;
const frame_time_divider = 8;
const alpha_decrease_start = 40;
const time_to_live = 80;

function createVector(x, y) {
    return {
        x: x, y: y
    };
}

class Color {
    constructor(r, g, b, alpha = default_alpha) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }

    toRGBString(alpha = this.alpha) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    }
}

const colors = [new Color(255, 0, 0), new Color(0, 255, 0), new Color(0, 0, 255), new Color(255, 255, 0), new Color(255, 0, 255), new Color(255, 122, 255), new Color(255, 122, 122)]

function random_number(max_speed, min_speed) {
    let speed = (Math.random() * max_speed * 2) - max_speed;
    speed = Math.abs(speed) > min_speed ? speed : (min_speed * (Math.random() > 0.5 ? -1 : 1));
    return speed;
}

function random_color() {
    return colors[Math.floor(Math.random() * colors.length)];
}

class Rocket {
    constructor(x, y, context, color = random_color()) {
        this.position = createVector(x, y);
        this.velocity = createVector(random_number(max_speed, min_speed), random_number(max_speed, min_speed));
        this.radius = 340;
        this.time_to_live = Math.random() * time_to_live + time_to_live;
        this.alive = true;
        this.context = context;
        this.color = color;
        this.gradient_seed = Math.random() * (this.radius * 2 - this.radius / 2) + this.radius / 2;
        this.calculate_gradient();
    }

    calculate_gradient() {
        this.gradient = this.context.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.radius);
        const step = 1 / this.radius;
        let i = 0;

        let hSqr = this.radius ** 2;
        let h = this.gradient_seed;
        let alpha_decrease = 0;
        if (this.time_to_live < alpha_decrease_start) {
            alpha_decrease = (alpha_decrease_start - this.time_to_live) / alpha_decrease_start * this.color.alpha;
        }
        while (i < 1) {
            const distSqr = (i * this.radius) ** 2 + hSqr;
            const ref = (h / distSqr ** 0.6) / distSqr;
            this.gradient.addColorStop(i, hexCol(this.color.r, this.color.g, this.color.b, (this.color.alpha - alpha_decrease) * 255 * hSqr * ref * (1 - i)));
            i += step;
        }
        this.gradient.addColorStop(1, "#0000");
    }

    update(context, update_speed) {
        this.time_to_live -= update_speed / frame_time_divider;
        this.position.x += this.velocity.x * update_speed / frame_time_divider;
        this.position.y += this.velocity.y * update_speed / frame_time_divider;
        this.alive = !(this.time_to_live < 0 || this.position.x < 0 || this.position.x > context.width || this.position.y < 0 || this.position.y > context.height);
        this.calculate_gradient();
    }

    draw(context) {
        context.fillStyle = this.gradient;
        context.fillRect(this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

const hexCol = (r, g, b, a) => "#" + ((r > 255 ? 255 : r < 0 ? 0 : r) | 0).toString(16).padStart(2, "0") + ((g > 255 ? 255 : g < 0 ? 0 : g) | 0).toString(16).padStart(2, "0") + ((b > 255 ? 255 : b < 0 ? 0 : b) | 0).toString(16).padStart(2, "0") + ((a > 255 ? 255 : a < 0 ? 0 : a) | 0).toString(16).padStart(2, "0");
