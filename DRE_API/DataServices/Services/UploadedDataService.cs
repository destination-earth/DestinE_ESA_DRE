using Interfaces;
using Org.BouncyCastle.Utilities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApiData.Entities;
using WebApiData.Helpers;

namespace WebApiData.Services
{
   public class UploadedDataService:IUploadedDataService
   {

        private readonly DataContext _context;


        public UploadedDataService(DataContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Inserts a batch of UploadedData entities in a single operation.
        /// </summary>
        public async Task SaveUploadedDataBatchAsync(IEnumerable<UploadedData> dataBatch)
        {
            _context.UploadedData.AddRange(dataBatch);
            await _context.SaveChangesAsync();
        }

 
        public async Task StoreWindRose(List<WindRose> windRose)
        {

            try
            {
                _context.WindRose.AddRange(windRose);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("StoreWindRose", ex);
            }
        }


 
        public async Task StoreWindDirectional(List<WindDirectional> windDirectional)
        {

            try
            {
                _context.WindDirectional.AddRange(windDirectional);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("StoreWindDirectional", ex);
            }
        }


 

    }
}
