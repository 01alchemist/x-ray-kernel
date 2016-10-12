struct Box{
    Vector min
    Vector max
}

Box BoxForShapes(Shape* shapes){

    int len = len(shapes);

    if (len == 0) {
        return new Box();
    }
    Box box = shapes[0].BoundingBox()

    for(int i = 0; i < len; i++){
        box = ExtendBox(box, shapes[i].BoundingBox())
    }

    for _, shape := range shapes {
        box = ExtendBox(box, shape.BoundingBox())
    }
    return box
}

Box BoxForTriangles(shapes []*Triangle){
    if len(shapes) == 0 {
        return Box{}
    }
    box := shapes[0].BoundingBox()
    for _, shape := range shapes {
        box = box.Extend(shape.BoundingBox())
    }
    return box
}

Vector Anchor(Box a, Vector anchor){
    return a.Min.Add(a.Size().Mul(anchor))
}

Vector Center(Box a){
    return a.Anchor(Vector{0.5, 0.5, 0.5})
}

double OuterRadius(Box a) {
    return a.Min.Sub(a.Center()).Length()
}

double InnerRadius(Box a) {
    return a.Center().Sub(a.Min).MaxComponent()
}

Vector Size(Box a) {
    return a.Max.Sub(a.Min)
}

ExtendBox(Box a, Box b) {
    return new Box(a.Min.Min(b.Min), a.Max.Max(b.Max))
}

bool Contains(Box a, Vector b) {
    return a.Min.X <= b.X && a.Max.X >= b.X &&
        a.Min.Y <= b.Y && a.Max.Y >= b.Y &&
        a.Min.Z <= b.Z && a.Max.Z >= b.Z
}

bool Intersects(Box a, Box b) {
    return !(a.Min.X > b.Max.X || a.Max.X < b.Min.X || a.Min.Y > b.Max.Y ||
        a.Max.Y < b.Min.Y || a.Min.Z > b.Max.Z || a.Max.Z < b.Min.Z)
}

(double, double) Intersect(Box* b, r Ray) {
    x1 := (b.Min.X - r.Origin.X) / r.Direction.X
    y1 := (b.Min.Y - r.Origin.Y) / r.Direction.Y
    z1 := (b.Min.Z - r.Origin.Z) / r.Direction.Z
    x2 := (b.Max.X - r.Origin.X) / r.Direction.X
    y2 := (b.Max.Y - r.Origin.Y) / r.Direction.Y
    z2 := (b.Max.Z - r.Origin.Z) / r.Direction.Z
    if x1 > x2 {
        x1, x2 = x2, x1
    }
    if y1 > y2 {
        y1, y2 = y2, y1
    }
    if z1 > z2 {
        z1, z2 = z2, z1
    }
    t1 := math.Max(math.Max(x1, y1), z1)
    t2 := math.Min(math.Min(x2, y2), z2)
    return t1, t2
}

(left, right bool) Partition(Box* b, axis Axis, point double) {
    switch axis {
        case AxisX:
            left = b.Min.X <= point
            right = b.Max.X >= point
        case AxisY:
            left = b.Min.Y <= point
            right = b.Max.Y >= point
        case AxisZ:
            left = b.Min.Z <= point
            right = b.Max.Z >= point
    }
    return
}