namespace xray{
    struct Color {
        double R;
        double G;
        double B;
    }

    void HexColor(int x) Color {
        double r = (double)((x>>16)&0xff) / 255
        double g = (double)((x>>8)&0xff) / 255
        double b = (double)((x>>0)&0xff) / 255
        return new Color(r, g, b).Pow(2.2)
    }
}