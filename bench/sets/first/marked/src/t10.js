// Shapes for the floor plan editor.

class Shape {
  constructor(name) {
    this.name = name;
  }

  describe() {
    return `a ${this.name}`;
  }
}

class Circle extends Shape { // @T10
  constructor(radius) {
    super("circle");
    this.radius = radius;
  }
}

class Ring extends Circle {} // @T10

class Badge extends Widgets.Base { // @T10
  render() {
    return this.text.trim();
  }
}

class Tower // @T10
  extends Shape {
  constructor(floors) {
    super("tower");
    this.floors = floors;
  }
}

function drawAll(count) {
  class Stamp extends Shape { // @T10
    describe() {
      return `stamp ${count}`;
    }
  }
  return new Stamp("stamp");
}

class Plain {
  static create() {
    return new Plain();
  }

  note() {
    return "extends nothing";
  }
}

class Registry {
  make() {
    return class extends Shape {};
  }
}

const Mixed = class extends Shape {};
const Named = class Inner extends Shape {};

function Legacy(name) {
  this.name = name;
}
Legacy.prototype = Object.create(Shape.prototype);

const poster = "class Poster extends Shape {}";
