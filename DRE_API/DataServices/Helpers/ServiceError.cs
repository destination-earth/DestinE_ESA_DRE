using System.Net;

namespace SharedKernel.Helpers
{
    public struct ServiceError
    {
        public string? Message  { get; private set; }
        public HttpStatusCode ErrorCode  { get; private set; }
        public object? ErrorObject  { get; private set; }

        public ServiceError(string? message, HttpStatusCode errorCode, object? errorObject = null)
        {
            Message = message;
            ErrorCode = errorCode;
            ErrorObject = errorObject;
        }

        public static ServiceError Unprocessable(string? message = null, object? errorObject = null)
        {
            return new(
                !string.IsNullOrWhiteSpace(message) ? message : HttpStatusCode.UnprocessableEntity.ToString("g"),
                HttpStatusCode.UnprocessableEntity, errorObject);
        }

        public static ServiceError Unauthorized(string? message = null, object? errorObject = null)
        {
            return new(
                !string.IsNullOrWhiteSpace(message) ? message : HttpStatusCode.Unauthorized.ToString("g"),
                HttpStatusCode.Unauthorized, errorObject);
        }

        public static ServiceError NotFound(string? message = null, object? errorObject = null)
        {
            return new(
                !string.IsNullOrWhiteSpace(message) ? message : HttpStatusCode.NotFound.ToString("g"),
                HttpStatusCode.NotFound, errorObject);
        }

        public static ServiceError BadRequest(string? message = null, object? errorObject = null)
        {
            return new(
                !string.IsNullOrWhiteSpace(message) ? message : HttpStatusCode.BadRequest.ToString("g"),
                HttpStatusCode.BadRequest, errorObject);
        }

        public static ServiceError InternalServerError(string? message = null, object? errorObject = null)
        {
            return new(
                !string.IsNullOrWhiteSpace(message) ? message : HttpStatusCode.InternalServerError.ToString("g"),
                HttpStatusCode.InternalServerError, errorObject);
        }
    }
}