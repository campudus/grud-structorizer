const structorizer = require("../index")("http://localhost:8181");
const ColumnBuilder = structorizer.ColumnBuilder;

describe("ColumnBuilder", () => {
  it("should fail on empty countryCodes with languageType 'country'", () => {
    expect(() => new ColumnBuilder("asdf", "asdf").languageType("country", undefined)).toThrow();
    expect(() => new ColumnBuilder("asdf", "asdf").languageType("country", [])).toThrow();
    expect(() => new ColumnBuilder("asdf", "asdf").languageType("country", null)).toThrow();
    expect(() => new ColumnBuilder("asdf", "asdf").languageType("country")).toThrow();
  });

  it("should fail on languageType != 'country', 'language', or 'neutral'", () => {
    expect(new ColumnBuilder("asdf", "asdf").languageType("country", ["DE"]).column)
      .toEqual(expect.objectContaining({
        languageType: "country",
        countryCodes: ["DE"]
      }));
    expect(new ColumnBuilder("asdf", "asdf").languageType("language").column)
      .toEqual(expect.objectContaining({
        languageType: "language"
      }));
    expect(new ColumnBuilder("asdf", "asdf").languageType("neutral").column)
      .toEqual(expect.objectContaining({
        languageType: "neutral"
      }));

    expect(() => new ColumnBuilder("asdf", "asdf").languageType("not valid", [])).toThrow();
  });

  it("should contain a multi-language object after calling description() with a list of strings", () => {
    expect(new ColumnBuilder("asdf", "asdf").description("de", "Hallo", "en", "Hello").column)
      .toEqual(expect.objectContaining({
        description: {
          de: "Hallo",
          en: "Hello"
        }
      }));
  });
});
