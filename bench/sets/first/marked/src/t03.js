// Hand-off between the sorting line and the loading dock.

const carton = { id: 7, weight: 3 };
const cartons = { waiting: 4 };

function ferry(carton, mode) {
  return depot.accept(carton.id, mode);
}

function ferryAll(group) {
  return depot.acceptMany(group);
}

ferry(carton); // @T03
ferry(carton, 1); // @T03
ferry(carton, carton); // @T03
ferry(carton, { urgent: true }, onDone); // @T03
ferry( // @T03
  carton,
  retries
);
const receipt = ferry(carton, "overnight"); // @T03
slots.forEach((slot) => ferry(carton, slot)); // @T03

ferry(1, carton);
ferry(null, carton);
ferry();
depot.ferry(carton);
ferry("carton");
ferry(carton.id);
ferry(cartons);
ferry(wrap(carton), 1);
ferryAll(carton);
