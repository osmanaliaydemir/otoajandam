using System.Globalization;

namespace Core.Exceptions;

// Proje genelinde fırlatılacak özel/bilinen iş kuralları (Business Rule) hatalarını temsil eder
public class ApiException : Exception
{
    public ApiException() : base() { }

    public ApiException(string message) : base(message) { }

    public ApiException(string message, params object[] args) 
        : base(string.Format(CultureInfo.CurrentCulture, message, args))
    {
    }
}
