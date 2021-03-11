import { SaveRentService } from "@services/save-rent";
import { SeLoger } from "../seloger/seloger";
const { MongoClient } = require('mongodb');
jest.mock("@services/save-rent");

const SaveRentServiceMock = SaveRentService as jest.MockedClass<
  typeof SaveRentService
>;

describe("seloger", () => {
  let connection: any;
  let db: any;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db('Rent');
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  beforeEach(() => {
    SaveRentServiceMock.mockClear();
  });

  test("returns clean ad", async (done) => {
    const body = {
      id: "234523",
      cityLabel: "Paris 75011",
      charges: "45E",
      description: "Une bien belle description ma foi",
      furnished: true,
      hasCharges: false,
      price: "1400",
      renter: "Particulier",
      rooms: "2 pièces",
      surface: "40m2",
      yearBuilt: null,
      title: "Joli 2 pièce bd valtair, 3 rue jean macé",
      platform: "chrome",
    };

    const mockResponse: any = {
      json: jest.fn(),
      status: jest.fn(),
    };

    const seloger = new SeLoger(mockResponse, { body });

    const data = await seloger.digData();

    expect(SaveRentServiceMock).toHaveBeenCalledTimes(1);
    expect(data).toEqual({
      detectedInfo: {
        address: { order: 0, value: "3 rue jean mace 75011, Paris" },
        hasFurniture: { order: 1, value: true },
        roomCount: { order: 2, value: 2 },
        surface: { order: 3, value: 40 },
        yearBuilt: { order: 4, value: "1900" },
        price: { order: 5, value: 1400 },
        charges: { order: 6, value: 45 },
        hasCharges: { order: 7, value: null },
      },
      computedInfo: {
        neighborhood: { order: 0, value: "Sainte-Marguerite" },
        hasFurniture: { order: 1, value: true },
        roomCount: { order: 2, value: 2 },
        surface: { order: 3, value: 40 },
        dateRange: { order: 4, value: "Avant 1946" },
        max: { order: 5, value: 33.36 },
        maxAuthorized: { order: 6, value: 1334.4 },
        promoPercentage: { order: 7, value: 1.52 },
      },
      isLegal: false,
    });

    done();
  });
});
