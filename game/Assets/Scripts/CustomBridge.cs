using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Newtonsoft.Json;
using UnityEngine;


public class CustomBridge
{
    [System.Serializable]
    private struct Result<T>
    {
        public T result;
    }

    [System.Serializable]
    private struct RequestMessageBody
    {
        public RequestMessageBody(string[] arguments)
        {
            this.arguments = arguments;
        }

        public string[] arguments;
    }

    private struct GenericAction
    {
        public Type t;
        public Delegate d;

        public GenericAction(Type t, Delegate d)
        {
            this.t = t;
            this.d = d;
        }
    }

    private static Dictionary<string, TaskCompletionSource<string>> taskMap = new Dictionary<string, TaskCompletionSource<string>>();


    public const string AddressZero = "0x0000000000000000000000000000000000000000";

    [AOT.MonoPInvokeCallback(typeof(Action<string, string, string>))]
    private static void jsCallback(string taskId, string result, string error)
    {
        if (taskMap.ContainsKey(taskId))
        {
            if (error != null)
            {
                taskMap[taskId].TrySetException(new Exception(error));
            }
            else
            {
                taskMap[taskId].TrySetResult(result);
            }
            taskMap.Remove(taskId);
        }
    }

    public static async Task<T> InvokeRoute<T>(string route, string[] body)
    {
        if (!IsWebGLBuild())
        {
            Debug.LogWarning("Interacting with the Custom Bridge is not fully supported in the editor.");
            return default(T);
        }
        var msg = ToJson(new RequestMessageBody(body));
        string taskId = Guid.NewGuid().ToString();
        var task = new TaskCompletionSource<string>();
        taskMap[taskId] = task;
#if UNITY_WEBGL
        ExecuteAny(taskId, route, msg, jsCallback);
#endif
        string result = await task.Task;
        // Debug.Log($"InvokeRoute Result: {result}");
        return JsonConvert.DeserializeObject<Result<T>>(result).result;
    }

    public static bool IsWebGLBuild()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        return true;
#else
        return false;
#endif
    }


    public static string[] ToJsonStringArray(params object[] args)
    {
        List<string> stringArgs = new List<string>();
        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] == null)
            {
                continue;
            }
            // if value type, convert to string otherwise serialize to json
            if (args[i].GetType().IsPrimitive || args[i] is string)
            {
                stringArgs.Add(args[i].ToString());
            }
            else
            {
                stringArgs.Add(ToJson(args[i]));
            }
        }
        return stringArgs.ToArray();
    }

    public static string ToJson(object obj)
    {
        return JsonConvert.SerializeObject(obj, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

    }
#if UNITY_WEBGL
    [DllImport("__Internal")]
    private static extern string ExecuteAny(string taskId, string route, string payload, Action<string, string, string> cb);
#endif
}
