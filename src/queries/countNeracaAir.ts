import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function countNeracaAir(month: number) {

    let apwl = 0;

    const monthConverterNumber = (month: number) => {
        switch (month) {
            case 1:
                return "Januari";
            case 2:
                return "Februari";
            case 3:
                return "Maret";
            case 4:
                return "April";
            case 5:
                return "Mei";
            case 6:
                return "Juni";
            case 7:
                return "Juli";
            case 8:
                return "Agustus";
            case 9:
                return "September";
            case 10:
                return "Oktober";
            case 11:
                return "November";
            case 12:
                return "Desember";
        }
    }

    const averageTemp = async (month: number): Promise<any> => {
        const avg = await prisma.tabelCuaca2023.aggregate({
            _avg: {
                t_avg: true
            },
            where: {
                bulan: monthConverterNumber(month)
            }
        });

        return avg._avg.t_avg;
    }

    const averageRR = async (month: number): Promise<any> => {
        const avg = await prisma.tabelCuaca2023.aggregate({
            _avg: {
                rr: true
            },
            where: {
                bulan: monthConverterNumber(month)
            }
        });

        return avg._avg.rr;
    }

    const calculateHeatIndex = async (month:number) => {
        return Math.pow((await averageTemp(month) / 5), 1.514)
    }

    const calculateETP = async (month: number): Promise<any> => {

        const iJanuari: number = Math.pow((await averageTemp(1) / 5), 1.514)
        const iFebruari: number = Math.pow((await averageTemp(2) / 5), 1.514)
        const iMaret: number = Math.pow((await averageTemp(3) / 5), 1.514)
        const iApril: number = Math.pow((await averageTemp(4) / 5), 1.514)
        const iMei: number = Math.pow((await averageTemp(5) / 5), 1.514)
        const iJuni: number = Math.pow((await averageTemp(6) / 5), 1.514)
        const iJuli: number = Math.pow((await averageTemp(7) / 5), 1.514)
        const iAgustus: number = Math.pow((await averageTemp(8) / 5), 1.514)
        const iSeptember: number = Math.pow((await averageTemp(9) / 5), 1.514)
        const iOktober: number = Math.pow((await averageTemp(10) / 5), 1.514)
        const iNovember: number = Math.pow((await averageTemp(11) / 5), 1.514)
        const iDesember: number = Math.pow((await averageTemp(12) / 5), 1.514)
       
        
        const iTahunan = iJanuari + iFebruari + iMaret + iApril + iMei + iJuni + iJuli + iAgustus + iSeptember + iOktober + iNovember + iDesember;
        const a = 675 * Math.pow(10, -9) * Math.pow(iTahunan, 3) - 771 * Math.pow(10, -7) * Math.pow(iTahunan, 2) + 1792 * Math.pow(10, -5) * iTahunan + 0.49239
        const etpBulanan = 16 * Math.pow((((await averageTemp(month)) * 10) / iTahunan), a)

        return etpBulanan;
    }

    const monthlyApwl = async (month: number): Promise<any> => {
        return await averageRR(month) - await calculateETP(month);
    }

    const accumulatedApwl = async (month: number): Promise<any> => {
        let accumulation = 0;

        if (month === 1) {
            return await monthlyApwl(month);
        } else {
            for (let index = month; index >= 1; index--) {
                console.log(index)
                accumulation = accumulation + await monthlyApwl(index)
            }
            return accumulation;
        }
    }

    const calculateKat = async (month: number) => {
        const katMax = 550;

        return katMax * Math.exp(await accumulatedApwl(month) / katMax) ;
    }

    const calculateAts = async (month: number) => {
        const kl = 800;
        const tlp = 250;
        return (await calculateKat(month) - tlp) / (kl - tlp) * 100;
    }

    const rr = await prisma.tabelCuaca2023.findMany()

    const response = {
        "ats": parseFloat((await calculateAts(month)).toFixed(2)),
        "kat": parseFloat((await calculateKat(month)).toFixed(2)),
        "etp": parseFloat((await calculateETP(month)).toFixed(2)),
        "apwl": parseFloat((await monthlyApwl(month)).toFixed(2)),
        "t_avg": parseFloat((await averageTemp(month)).toFixed(2)),
        "rr": parseFloat((await averageRR(month)).toFixed(2)),
        "heat_index": parseFloat((await calculateHeatIndex(month)).toFixed(2)),

    };
    
    return response;
}