using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataServices.Helpers
{
    public static class HelperTools
    {

        public static DateTime ConvertDateTime(string dateStr)
        {
             string format = "yyyy-MM-dd";

            // Try parsing the date
            if (DateTime.TryParseExact(dateStr, format, null, System.Globalization.DateTimeStyles.None, out DateTime result))
            {
                return result;
            }
            else
            {
                return DateTime.MinValue;
            }
 


        }

    }
}
