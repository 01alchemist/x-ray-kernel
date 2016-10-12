namespace xray
{
    struct Scene {
        Color        Color
    	Texture      Texture
    	TextureAngle float64
    	Shapes       []Shape
    	Lights       []Shape
    	tree         *Tree
    	rays         uint64
    }
}