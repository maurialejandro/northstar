import { injectable } from 'tsyringe';

@injectable()
export class DateUtils {

    currentMonthForBudgetCard(): { fromDate: string, toDate: string } {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            fromDate: this.formatDate(firstDay),
            toDate: this.formatDate(lastDay)
        };
    }

    currentMonth(): { fromDate: string, toDate: string } {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            fromDate: firstDay.toISOString(),
            toDate: lastDay.toISOString()
        };
    }

    extendedCurrentMonth(): { fromDate: string, toDate: string } {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const firstDayMinus7 = new Date(firstDay);
        firstDayMinus7.setDate(firstDay.getDate() - 7);

        const lastDayPlus7 = new Date(lastDay);
        lastDayPlus7.setDate(lastDay.getDate() + 7);

        return {
            fromDate: firstDayMinus7.toISOString(),
            toDate: lastDayPlus7.toISOString()
        };
    }

    formatDate(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}/${date.getFullYear()}`;
    }

    formatRangeToUTC(parsedDateRange: string[]): { fromDate: string, toDate: string } {
        // Format the start date
        parsedDateRange[0] = parsedDateRange[0] !== '' ? new Date(parsedDateRange[0]).toISOString() : '';

        // Format the end date
        if (parsedDateRange[1] !== '') {
            const d = new Date(parsedDateRange[1]);
            d.setUTCHours(23, 59, 59, 999);
            parsedDateRange[1] = d.toISOString();
        } else {
            const now = new Date();
            now.setUTCHours(23, 59, 59, 999);
            parsedDateRange[1] = now.toISOString();
        }

        return { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] };
    }

}
