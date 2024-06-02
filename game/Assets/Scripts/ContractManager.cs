using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using System.Numerics;
using TMPro;
using UnityEngine.UI;
using Nethereum.Web3;
using System.Runtime.InteropServices;

public struct TransactionValue
{
    public string value;
}

public struct Land
{
    public BigInteger xIndex;
    public BigInteger yIndex;
}
public struct Listing
{
    public int id;
    public string sellerAddress;
    public bool inUSD;
    public int landId;
    public int xIndex;
    public int yIndex;
    public string price;
    public int timestamp;
    public bool isValid;
    public bool isAuction;
    public int auctionTime;
}
public struct Listings
{
    public List<Listing> listings;
}

public class ContractManager : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void SignIn();
    public const int EMPTY = 0;
    public const int ROAD = 1;
    public const int HOUSE = 2;
    public const int SPECIAL = 3;
    public enum Contracts
    {
        Map,
        Utils,
        Faucet,
        Marketplace,
        Forwarder,
        LinkToken
    };

    string mapContractAddress = "";
    string utilsContractAddress = "";
    string faucetContractAddress = "";
    string marketplaceContractAddress = "";
    string linkTokenContractAddress = "";

    public bool isUSDCompatible = false;
    public bool isAuctionCompatible = false;

    public static ContractManager Instance { get; private set; }
    public MapManager mapManager;
    public PlacementManager placementManager;
    public UIController uiController;
    public GameManager gameManager;
    public CanvasManager canvasManager;
    public StructureManager structureManager;
    public RoadManager roadManager;
    public TextMeshProUGUI loadingText;
    public Button utilsFaucetButton, landFaucetButton, marketplaceButton;

    Task initializeMapTask;
    string walletAddress;
    int roadBalance = 0;
    int houseBalance = 0;
    int specialBalance = 0;
    int roadEditedBalance = 0;
    int houseEditedBalance = 0;
    int specialEditedBalance = 0;
    int mapBalance = 0;
    int size = 0;
    public int perSize = 0;
    int landCount = 0;
    int[] landOwnedIds = null;
    Land[] landOwnedIndexes = null;
    bool[,] landOwned = null;
    int[,] map = null;
    public int[,] editedMap = null;
    bool isError = false;
    string errorText = "ERROR!!!";
    float timePassed = 0;
    float errorDuration = 5f;
    Listings[,] listings = null;


    public struct Index
    {
        public int xIndex;
        public int yIndex;
    }

    private void Awake()
    {
        // Single persistent instance at all times.
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(this.gameObject);
        }
        else
        {
            Debug.LogWarning("Two ContractManager instances were found, removing this one.");
            Destroy(this.gameObject);
            return;
        }

    }

    // Start is called before the first frame update
    void Start()
    {
        SetWalletCallback();
        CheckInitialConnected();
        ResetData();
    }

    async public void CheckInitialConnected()
    {
        bool isConnected = await WalletConnected();
        if (isConnected)
        {
            OnWalletConnect();
        }
    }

    async public void SetWalletCallback()
    {
        await CustomBridge.InvokeRoute<object>("OnWalletConnect", new string[] { "OnWalletConnect" });
        await CustomBridge.InvokeRoute<object>("OnWalletDisconnect", new string[] { "OnWalletDisconnect" });
        await CustomBridge.InvokeRoute<object>("OnSwitchNetwork", new string[] { "OnSwitchNetwork" });
    }

    async public Task<bool> WalletConnected()
    {
        return await CustomBridge.InvokeRoute<bool>("WalletConnected", new String[0]);
    }

    async public Task<string> ChainId()
    {
        return await CustomBridge.InvokeRoute<string>("ChainId", new String[0]);
    }

    async public Task<string> WalletAddress()
    {
        return await CustomBridge.InvokeRoute<string>("WalletAddress", new String[0]);
    }

    async public Task<string> ContractAddress(Contracts contract)
    {
        string contractName = contract.ToString();
        return await CustomBridge.InvokeRoute<string>("ContractAddress", new string[] { contractName });
    }

    async public Task<T> ContractRead<T>(Contracts contract, string functionName, params object[] args)
    {
        string contractName = contract.ToString();
        return await CustomBridge.InvokeRoute<T>("ContractRead", CustomBridge.ToJsonStringArray(contractName, functionName, args));
    }

    async public Task ContractWrite(Contracts contract, string functionName, params object[] args)
    {
        string contractName = contract.ToString();
        await CustomBridge.InvokeRoute<object>("ContractWrite", CustomBridge.ToJsonStringArray(contractName, functionName, args));
    }

    public Dictionary<string, string> GetCCIPSupportedAddresses()
    {
        return new Dictionary<string, string>()
        {
            { "Polygon Amoy", "80002" },
            { "AVALANCHE FUJI", "43113" },
        };
    }
    public Dictionary<string, string> GetLxLySupportedAddresses()
    {
        return new Dictionary<string, string>()
        {
            { "Polygon ZKEVM Cardona Testnet", "2442" },
            { "SEPOLIA", "11155111" },
        };
    }

    public bool isCrossChainTransferSupportedFromChainId(string chainId)
    {
        return GetCCIPSupportedAddresses().ContainsValue(chainId) || GetLxLySupportedAddresses().ContainsValue(chainId);
    }

    public bool isCrossChainTransferSupportedFromChainName(string chainName)
    {
        return GetCCIPSupportedAddresses().ContainsKey(chainName) || GetLxLySupportedAddresses().ContainsKey(chainName);
    }

    public (bool, string) GetChainIdFromChainNameCrossChainTransfer(string chainName)
    {
        if (ContractManager.Instance.isCrossChainTransferSupportedFromChainName(chainName))
        {
            return (false, "");
        }
        if (ContractManager.Instance.GetCCIPSupportedAddresses().ContainsKey(chainName))
        {
            return (true, ContractManager.Instance.GetCCIPSupportedAddresses()[chainName]);
        }
        else if (ContractManager.Instance.GetLxLySupportedAddresses().ContainsKey(chainName))
        {
            return (true, ContractManager.Instance.GetLxLySupportedAddresses()[chainName]);
        }
        // Should never reach
        return (false, "");
    }

    private async Task Initialize()
    {
        string chainId = await ChainId();
        if (isCrossChainTransferSupportedFromChainId(chainId))
        {
            canvasManager.ShowTransferUtilsButton();
        }
        else
        {
            canvasManager.HideTransferUtilsButton();
        }
        mapContractAddress = await ContractAddress(Contracts.Map);
        utilsContractAddress = await ContractAddress(Contracts.Utils);
        faucetContractAddress = await ContractAddress(Contracts.Faucet);
        marketplaceContractAddress = await ContractAddress(Contracts.Marketplace);

        marketplaceButton.gameObject.SetActive(true);

        linkTokenContractAddress = await ContractRead<string>(Contracts.Marketplace, "i_link");
        if (linkTokenContractAddress == CustomBridge.AddressZero)
        {
            isAuctionCompatible = false;
            if (canvasManager.typeDropdown.options.Count == 2)
            {
                canvasManager.typeDropdown.options.Remove(canvasManager.typeDropdown.options[1]);
            }
        }
        else
        {
            isAuctionCompatible = true;
            if (canvasManager.typeDropdown.options.Count == 1)
            {
                canvasManager.typeDropdown.options.Add(new TMP_Dropdown.OptionData { text = "Auction" });
            }
        }

        string usdPriceFeedAddress = await ContractRead<string>(Contracts.Marketplace, "eth_usd_priceFeed");
        if (usdPriceFeedAddress == CustomBridge.AddressZero)
        {
            isUSDCompatible = false;
            canvasManager.usdToggle.gameObject.SetActive(false);
        }
        else
        {
            isAuctionCompatible = true;
            canvasManager.usdToggle.gameObject.SetActive(true);
        }
        initializeMapTask = InitializeMap();
    }

    // Update is called once per frame
    void Update()
    {
        if (isError)
        {
            loadingText.enabled = true;
            loadingText.text = errorText;
            timePassed += Time.deltaTime;
            if (timePassed >= errorDuration)
            {
                isError = false;
                timePassed = 0;
                errorText = "ERROR!!!";
                loadingText.text = "LOADING: 0%";
                loadingText.enabled = false;
            }
        }
    }

    private async Task InitializeMap()
    {
        mapManager.destroyHighlights();
        size = await getSize();
        landOwned = new bool[size, size];
        map = new int[size, size];
        editedMap = new int[size, size];
        placementManager.InitializeMap(size);
        mapManager.updateGridSize(size);
        perSize = await getPerSize();
        landCount = await getLandCount();
    }

    private async Task<int> getLandCount()
    {
        var landCount = await ContractRead<int>(Contracts.Map, "landCount");
        Debug.Log("landCount: " + landCount);
        return landCount;
    }

    private async Task<int> getPerSize()
    {
        var perSize = await ContractRead<int>(Contracts.Map, "perSize");
        Debug.Log("perSize: " + perSize);
        return perSize;
    }

    private async Task<int> getSize()
    {
        var size = await ContractRead<int>(Contracts.Map, "size");
        Debug.Log("Size: " + size);
        return size;
    }

    public async Task setItemBalances()
    {

        Debug.Log("ROAD BALANCE QUERYING...");
        roadBalance = await ContractRead<int>(Contracts.Utils, "balanceOf", walletAddress, ROAD);
        Debug.Log("roadBalance: " + roadBalance);
        houseBalance = await ContractRead<int>(Contracts.Utils, "balanceOf", walletAddress, HOUSE);
        specialBalance = await ContractRead<int>(Contracts.Utils, "balanceOf", walletAddress, SPECIAL);
        Debug.Log("item balances: " + roadBalance + " " + houseBalance + " " + specialBalance);
        if (roadBalance == 0 || houseBalance == 0 || specialBalance == 0)
        {
            Debug.Log("INSUFFICIENT UTILS BALANCE");
            utilsFaucetButton.gameObject.SetActive(true);
        }
        else
        {
            Debug.Log("SUFFICIENT UTILS BALANCE");
            utilsFaucetButton.gameObject.SetActive(false);
        }
        roadEditedBalance = roadBalance;
        houseEditedBalance = houseBalance;
        specialEditedBalance = specialBalance;
        Debug.Log("item edited balances: " + roadEditedBalance + " " + houseEditedBalance + " " + specialEditedBalance);
        uiController.updateRoadBalance(roadEditedBalance);
        uiController.updateHouseBalance(houseEditedBalance);
        uiController.updateSpecialBalance(specialEditedBalance);
    }
    private async Task<int> getMapBalance()
    {
        Debug.Log("TEST101010!!! " + walletAddress);
        int balance = await ContractRead<int>(Contracts.Map, "balanceOf", walletAddress);
        Debug.Log("TEST111111!!!");
        Debug.Log("map balance of user: " + balance);
        if (balance == 0)
        {
            Debug.Log("INSUFFICIENT MAP BALANCE");
            landFaucetButton.gameObject.SetActive(true);
        }
        else
        {
            Debug.Log("SUFFICIENT MAP BALANCE");
            landFaucetButton.gameObject.SetActive(false);
        }
        return balance;
    }

    private async Task<int[]> getLandOwnedIDs()
    {
        int[] ids = new int[mapBalance];
        int index = 0;
        for (int i = 1; i <= landCount; i++)
        {
            string owner = await ContractRead<string>(Contracts.Map, "ownerOf", i);
            Debug.Log("owner of land " + i + ": " + owner);
            if (owner.ToLower() == walletAddress.ToLower())
            {
                ids[index++] = i;
            }
        }
        Debug.Log("ids: " + string.Join(",", ids));
        return ids;
    }

    private async Task<Land[]> getLandOwnedIndexes()
    {
        Land[] indexes = new Land[mapBalance];
        int i = 0;
        Debug.Log("landOwnedIds.Length: " + landOwnedIds.Length);
        foreach (int id in landOwnedIds)
        {
            Debug.Log("id: " + id);
            List<object> result = await ContractRead<List<object>>(Contracts.Map, "land", id);
            Debug.Log("xIndex: " + result[0].ToString());
            Debug.Log("yIndex: " + result[1].ToString());
            Land myLandResult = new Land();
            myLandResult.xIndex = BigInteger.Parse(result[0].ToString());
            myLandResult.yIndex = BigInteger.Parse(result[1].ToString());
            indexes[i++] = myLandResult;
            i++;
        }
        Debug.Log("total i " + i);

        var s = "{";
        for (int x = 0; x < indexes.Length; x++)
        {
            s += "(" + indexes[x].xIndex + "," + indexes[x].yIndex + "),";
        }
        s += '}';
        Debug.Log("indexes: " + s);
        return indexes;
    }

    private void updateLandOwned(int size, int perSize, Land[] landOwnedIndexes)
    {
        landOwned = new bool[size, size];
        foreach (var land in landOwnedIndexes)
        {
            int x1 = (int)land.xIndex * perSize;
            int y1 = (int)land.yIndex * perSize;
            int x2 = x1 + perSize - 1;
            int y2 = y1 + perSize - 1;
            int tmpY1 = y1;
            while (x1 <= x2)
            {
                while (y1 <= y2)
                {
                    landOwned[x1, y1] = true;
                    y1++;
                }
                y1 = tmpY1;
                x1++;
            }
        }
    }

    private async Task updateMap(int size)
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        map = new int[size, size];
        for (int x = 0; x < size; x++)
        {
            Task[] tasks = new Task[size];
            int index = 0;
            for (int y = 0; y < size; y++)
            {
                loadingText.text = "Loading: " + ((int)((x * size + y) * 100f / (size * size))) + "%";
                tasks[index++] = updateMapIndex(x, y);

            }
            // await Task.WhenAll(tasks);
            // now you are at the UI thread
            foreach (var t in tasks)
            {
                try
                {
                    await t;
                }
                catch (Exception ex)
                {
                    Debug.LogException(ex);
                }
            }
        }
        loadingText.text = "Loading: 100%";
        loadingText.enabled = false;
        // await Task.WhenAll(tasks.Where(t => t != null).ToArray()); // if tasks returns null
        // await Task.WhenAll(tasks);
    }

    private async Task<int> updateMapIndex(int x, int y)
    {
        try
        {
            Debug.Log("map getting for: " + x + "," + y);
            map[x, y] = await ContractRead<int>(Contracts.Map, "map", x, y);
            Debug.Log("Got: " + x + "," + y + "," + map[x, y]);
            return map[x, y];
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
        }
        return 0;
    }

    private void initializeMapItems()
    {
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                Debug.Log("add: " + i + "," + j + "," + map[i, j]);
                int item = map[i, j];
                Vector3Int position = new Vector3Int(i, 0, j);
                placeItem(position, item, false);
            }
        }
    }

    public void removeItem(Vector3Int position, bool fromUser = true)
    {
        structureManager.DeleteItem(position, fromUser);
        roadManager.FixRoadPrefabsAfterDelete(position, fromUser);
    }

    public void placeRoad(Vector3Int position, bool fromUser = true)
    {
        roadManager.PlaceRoad(position, fromUser);
        roadManager.FinishPlacingRoad();
    }

    public void placeHouse(Vector3Int position, bool fromUser = true)
    {
        structureManager.PlaceHouse(position, fromUser);
    }

    public void placeSpecial(Vector3Int position, bool fromUser = true)
    {
        structureManager.PlaceSpecial(position, fromUser);
    }

    public void placeItem(Vector3Int position, int item, bool fromUser = true)
    {
        if (item == EMPTY)
        {
            removeItem(position, fromUser);
        }
        else if (item == ROAD)
        {
            placeRoad(position, fromUser);
        }
        else if (item == HOUSE)
        {
            placeHouse(position, fromUser);
        }
        else if (item == SPECIAL)
        {
            placeSpecial(position, fromUser);
        }
    }

    private async Task setUserData(bool queryMap = true)
    {
        mapManager.destroyHighlights();
        walletAddress = await WalletAddress();
        await setItemBalances();
        mapBalance = await getMapBalance();
        uiController.updateMapBalance(mapBalance);
        landOwnedIds = await getLandOwnedIDs();
        landOwnedIndexes = await getLandOwnedIndexes();
        await initializeMapTask; // wait for map to be initialized if not already
        mapManager.highlightOwnedLands(landOwnedIndexes, perSize);
        updateLandOwned(size, perSize, landOwnedIndexes);
        if (queryMap)
        {
            await updateMap(size);
            initializeMapItems();
        }
    }

    private void DebugMap()
    {
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                Debug.Log("map(" + i + "," + j + ") = " + map[i, j] + " | " + "editedMap(" + i + "," + j + ") = " + editedMap[i, j]);
            }
        }
    }

    public void updateEditedMap(Vector3Int position, CellType cell)
    {
        if (cell == CellType.Empty)
        {
            editedMap[position.x, position.z] = EMPTY;
        }
        else if (cell == CellType.Road)
        {
            editedMap[position.x, position.z] = ROAD;
        }
        else if (cell == CellType.Structure)
        {
            editedMap[position.x, position.z] = HOUSE;
        }
        else if (cell == CellType.SpecialStructure)
        {
            editedMap[position.x, position.z] = SPECIAL;
        }
        else
        {
            // shouldn't come here
        }
    }

    public bool AddRoad()
    {
        if (roadEditedBalance == 0) return false;
        roadEditedBalance--;
        uiController.updateRoadBalance(roadEditedBalance);
        return true;
    }

    public bool AddHouse()
    {
        if (houseEditedBalance == 0) return false;
        houseEditedBalance--;
        uiController.updateHouseBalance(houseEditedBalance);
        return true;
    }

    public bool AddSpecial()
    {
        if (specialEditedBalance == 0) return false;
        specialEditedBalance--;
        uiController.updateSpecialBalance(specialEditedBalance);
        return true;
    }

    public void DeleteItem(Vector3Int position)
    {
        int x = position.x;
        int y = position.z;
        if (editedMap[x, y] == ROAD)
        {
            roadEditedBalance++;
            uiController.updateRoadBalance(roadEditedBalance);
        }
        else if (editedMap[x, y] == HOUSE)
        {
            houseEditedBalance++;
            uiController.updateHouseBalance(houseEditedBalance);
        }
        else if (editedMap[x, y] == SPECIAL)
        {
            specialEditedBalance++;
            uiController.updateSpecialBalance(specialEditedBalance);
        }
        else
        {
            Debug.Log("NO MATCH: " + editedMap[x, y] + " , " + x + " , " + y);
        }
    }

    public void CancelClicked()
    {
        gameManager.ClearInputActions();
        roadEditedBalance = roadBalance;
        houseEditedBalance = houseBalance;
        specialEditedBalance = specialBalance;
        uiController.updateRoadBalance(roadEditedBalance);
        uiController.updateHouseBalance(houseEditedBalance);
        uiController.updateSpecialBalance(specialEditedBalance);
        editedMap = new int[size, size];
        copyMapToEditedMap();
        initializeMapItems();
    }

    private void copyMapToEditedMap()
    {
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                editedMap[i, j] = map[i, j];
            }
        }
    }

    public async Task confirmMapUpdates()
    {
        int[] x;
        int[] y;
        int[] utilId;
        int len = 0;
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                if (map[i, j] != editedMap[i, j])
                {
                    len++;
                }
            }
        }
        if (len == 0)
        {
            return;
        }
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        canvasManager.RemoveClickListeners();
        x = new int[len];
        y = new int[len];
        utilId = new int[len];
        int index = 0;
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                if (map[i, j] != editedMap[i, j])
                {
                    x[index] = i;
                    y[index] = j;
                    utilId[index] = editedMap[i, j];
                    Debug.Log("diff: " + i + "," + j + "," + map[i, j] + "," + editedMap[i, j]);
                    index++;
                }
            }
        }
        loadingText.text = "Loading: 10%";
        try
        {
            bool result = await ContractRead<bool>(Contracts.Utils, "isApprovedForAll", walletAddress, mapContractAddress);
            if (!result)
            {
                loadingText.text = "Loading: 20%";
                await ContractWrite(Contracts.Utils, "setApprovalForAll", mapContractAddress, true);
            }
            loadingText.text = "Loading: 65%";
            await ContractWrite(Contracts.Map, "updateItems", x, y, utilId);
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
            await setUserData();
        }
        catch (Exception e)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogError(e);
        }
        canvasManager.AttachClickListeners();
    }

    // x,y are co-ordinates and not land Index
    public bool userOwnsIndex(int x, int y)
    {
        if (landOwned == null)
        {
            return false;
        }
        return landOwned[x, y];
    }
    public bool landListedIndex(int xIndex, int yIndex)
    {
        if (listings == null)
        {
            return false;
        }
        if (listings[xIndex, yIndex].listings == null)
        {
            return false;
        }

        bool listed = false;

        foreach (var listing in listings[xIndex, yIndex].listings)
        {
            if (listing.isValid)
            {
                listed = true;
                break;
            }
        }

        return listed;
    }
    private async Task setData()
    {
        await Initialize();
        Debug.Log("TEST444!!!");
        await setUserData();
        Debug.Log("TEST555!!!");
        canvasManager.AttachClickListeners();
    }

    private void ResetData()
    {
        gameManager.ClearInputActions();
        canvasManager.RemoveClickListeners();
        walletAddress = "";
        mapBalance = 0;
        map = new int[size, size];
        editedMap = new int[size, size];
        loadingText.enabled = false;
        utilsFaucetButton.gameObject.SetActive(false);
        landFaucetButton.gameObject.SetActive(false);
        marketplaceButton.gameObject.SetActive(false);
        canvasManager.HideTransferUtilsButton();
    }

    public async void GetUtilsFaucet()
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        try
        {
            await ContractWrite(Contracts.Faucet, "getToken", utilsContractAddress, ROAD);
            loadingText.text = "Loading: 30%";
            await ContractWrite(Contracts.Faucet, "getToken", utilsContractAddress, HOUSE);
            loadingText.text = "Loading:60%";
            await ContractWrite(Contracts.Faucet, "getToken", utilsContractAddress, SPECIAL);
            loadingText.text = "Loading: 90%";
            await setItemBalances();
            loadingText.text = "Loading: 100%";
        }
        catch (Exception ex)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogError(ex);
            await setItemBalances();
        }
        loadingText.enabled = false;
    }

    public async void GetLandFaucet()
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        try
        {
            if (landCount >= ((size / perSize) * (size / perSize)))
            {
                errorText = "NO LAND LEFT";
                isError = true;
                return;
            }
            List<Land> landsUnavailable = new List<Land>();
            for (int i = 1; i <= landCount; i++)
            {
                List<object> result = await ContractRead<List<object>>(Contracts.Map, "land", i);
                Debug.Log("xIndex: " + result[0].ToString());
                Debug.Log("yIndex: " + result[1].ToString());
                Land myLandResult = new Land();
                myLandResult.xIndex = BigInteger.Parse(result[0].ToString());
                myLandResult.yIndex = BigInteger.Parse(result[1].ToString());
                landsUnavailable.Add(myLandResult);
                loadingText.text = "Loading: " + (i * 50 / landCount) + "%";
            }
            loadingText.text = "Loading: 50%";
            int xAvailable = 0, yAvailable = 0;
            for (int x = 0; x < size / perSize; x++)
            {
                bool isAvailable = false;
                for (int y = 0; y < size / perSize; y++)
                {
                    Land currentLand = new Land();
                    currentLand.xIndex = x;
                    currentLand.yIndex = y;
                    if (!landsUnavailable.Contains(currentLand))
                    {
                        xAvailable = x;
                        yAvailable = y;
                        isAvailable = true;
                        break;
                    }
                }
                if (isAvailable)
                {
                    break;
                }
            }
            loadingText.text = "Loading: 60%";
            await ContractWrite(Contracts.Map, "mint", xAvailable, yAvailable);
            loadingText.text = "Loading: 90%";
            landCount = await getLandCount();
            loadingText.text = "Loading: 91%";
            await setUserData(false);
            loadingText.text = "Loading: 100%";
        }
        catch (Exception ex)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogError(ex);
        }
        loadingText.enabled = false;
    }

    public async Task CreateListing(bool inUSD, int xIndex, int yIndex, string price, bool isAuction, string auctionTime, string amount)
    {
        try
        {
            loadingText.enabled = true;
            loadingText.text = "Loading: 0%";

            Debug.Log("Details01: " + inUSD);
            Debug.Log("Details02: " + xIndex);
            Debug.Log("Details03: " + yIndex);
            Debug.Log("Details04: " + Web3.Convert.ToWei(price).ToString());
            Debug.Log("Details05: " + isAuction);
            Debug.Log("Details06: " + auctionTime);
            Debug.Log("Details07: " + Web3.Convert.ToWei(amount).ToString());
            int landId = await ContractRead<int>(Contracts.Map, "landIds", xIndex, yIndex);
            loadingText.text = "Loading: 15%";
            Debug.Log("LandId: " + landId);

            bool isApproved = await ContractRead<bool>(Contracts.Map, "isApprovedForAll", walletAddress, marketplaceContractAddress);
            loadingText.text = "Loading: 25%";
            if (!isApproved)
            {
                await ContractWrite(Contracts.Map, "setApprovalForAll", marketplaceContractAddress, true);
            }
            if (isAuction)
            {
                int allowance = await ContractRead<int>(Contracts.LinkToken, "allowance", walletAddress, marketplaceContractAddress);
                loadingText.text = "Loading: 35%";
                if (allowance < Web3.Convert.ToWei(amount))
                {
                    await ContractWrite(Contracts.LinkToken, "approve", marketplaceContractAddress, Web3.Convert.ToWei(amount).ToString());
                }
            }
            loadingText.text = "Loading: 60%";
            await ContractWrite(Contracts.Marketplace, "createListing", inUSD, landId, Web3.Convert.ToWei(price).ToString(), isAuction, auctionTime, Web3.Convert.ToWei(amount).ToString());
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
        }
        catch (Exception ex)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogError(ex);
        }
    }

    public async Task<bool> SetMarketplaceData()
    {
        try
        {
            loadingText.enabled = true;
            loadingText.text = "Loading: 0%";
            int listingCount = await ContractRead<int>(Contracts.Marketplace, "listingCount");
            listings = new Listings[size / perSize, size / perSize];
            Debug.Log("ListingCount: " + listingCount);
            List<Land> listingLands = new List<Land>();
            for (int i = 1; i <= listingCount; i++)
            {
                Debug.Log("ListingID: " + i);
                List<object> result = await ContractRead<List<object>>(Contracts.Marketplace, "listings", i);
                loadingText.text = "Loading: " + ((2 * i - 1) * 100) / (listingCount * 2) + "%";
                Debug.Log("seller: " + result[0].ToString());
                Debug.Log("inUSD: " + result[1].ToString());
                Debug.Log("tokenId: " + result[2].ToString());
                Debug.Log("price: " + result[3].ToString());
                Debug.Log("timestamp: " + result[4].ToString());
                Debug.Log("isValid: " + result[5].ToString());
                Debug.Log("isAuction: " + result[6].ToString());
                Debug.Log("aucionTime: " + result[7].ToString());
                Listing listingResult = new Listing();
                listingResult.id = i;

                listingResult.sellerAddress = result[0].ToString();
                listingResult.inUSD = result[1].ToString() == "True";

                listingResult.landId = Int32.Parse(result[2].ToString());
                List<object> indexes = await ContractRead<List<object>>(Contracts.Map, "land", listingResult.landId);
                loadingText.text = "Loading: " + ((2 * i) * 100) / (listingCount * 2) + "%";
                Debug.Log("xIndex: " + indexes[0].ToString());
                Debug.Log("yIndex: " + indexes[1].ToString());
                listingResult.xIndex = Int32.Parse(indexes[0].ToString());
                listingResult.yIndex = Int32.Parse(indexes[1].ToString());


                listingResult.price = result[3].ToString();
                listingResult.timestamp = Int32.Parse(result[4].ToString());
                listingResult.isValid = result[5].ToString() == "True";
                listingResult.isAuction = result[6].ToString() == "True";
                listingResult.auctionTime = Int32.Parse(result[7].ToString());
                if (listingResult.isValid)
                {
                    Debug.Log("Add listing: " + listingResult.xIndex + " | " + listingResult.yIndex); ;
                    listingLands.Add(new Land { xIndex = listingResult.xIndex, yIndex = listingResult.yIndex });
                }

                Debug.Log("seller1: " + listingResult.sellerAddress);
                Debug.Log("inUSD1: " + listingResult.inUSD);
                Debug.Log("tokenId1: " + listingResult.landId);
                Debug.Log("price1: " + listingResult.price);
                Debug.Log("timestamp1: " + listingResult.timestamp);
                Debug.Log("isValid1: " + listingResult.isValid);
                Debug.Log("isAuction1: " + listingResult.isAuction);
                Debug.Log("aucionTime1: " + listingResult.auctionTime);
                Debug.Log("xIndex1: " + listingResult.xIndex);
                Debug.Log("yIndex1: " + listingResult.yIndex);

                Listings currentListing = listings[listingResult.xIndex, listingResult.yIndex];
                if (currentListing.listings == null)
                {
                    currentListing.listings = new List<Listing>();
                }
                currentListing.listings.Add(listingResult);
                listings[listingResult.xIndex, listingResult.yIndex] = currentListing;
            }
            Debug.Log("calling highlights: " + listingLands.Count);
            mapManager.highlightListings(listingLands.ToArray(), perSize);
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
            return true;
        }
        catch (Exception ex)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogException(ex);
            return false;
        }
    }

    public async Task<bool> BuyListing(int listingId, string price)
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        try
        {
            await ContractWrite(Contracts.Marketplace, "buyListing", new TransactionValue() { value = price }, listingId);
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
            return true;
        }
        catch (Exception e)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogException(e);
            return false;
        }
    }

    public async Task<bool> BidListing(int listingId, string highestBid, string bid)
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        try
        {
            if (bid == "")
            {
                errorText = "Invalid Bid";
                isError = true;
                errorText = "Invalid Bid";
                Debug.Log("Invalid Bid");
                return false;
            }
            if (BigInteger.Parse(Web3.Convert.ToWei(bid).ToString()) <= BigInteger.Parse(highestBid))
            {
                errorText = "Low Bid";
                isError = true;
                errorText = "Low Bid";
                Debug.Log("Low Bid");
                return false;
            }
            await ContractWrite(Contracts.Marketplace, "bid", new TransactionValue() { value = Web3.Convert.ToWei(bid).ToString() }, listingId);
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
            return true;
        }
        catch (Exception e)
        {
            loadingText.text = "ERROR!!!";
            isError = true;
            Debug.LogException(e);
            return false;
        }
    }

    public async Task<bool> TransferUtilsCrossChain(int destChain, int tokenId, string amount)
    {
        loadingText.enabled = true;
        loadingText.text = "Loading: 0%";
        try
        {
            if (amount == "" || amount == "0" || BigInteger.Parse(amount) <= 0)
            {
                errorText = "Invalid Amount";
                isError = true;
                errorText = "Invalid Amount";
                Debug.Log("Invalid Amount");
                return false;
            }

            int tokenAmount = 0;
            if (tokenId == 0)
            {
                tokenAmount = roadBalance;
            }
            else if (tokenId == 1)
            {
                tokenAmount = houseBalance;
            }
            else if (tokenId == 2)
            {
                tokenAmount = specialBalance;
            }

            if (BigInteger.Parse(amount) > tokenAmount)
            {
                errorText = "Insufficient Amount";
                isError = true;
                errorText = "Insufficient Amount";
                Debug.Log("Insufficient Amount");
                return false;
            }
            loadingText.text = "Loading: 10%";
            if (GetCCIPSupportedAddresses().ContainsValue(destChain.ToString()))
            {

                string amountLinkToken = await ContractRead<string>(Contracts.Utils, "getLinkFees", destChain, tokenId, amount, walletAddress);
                loadingText.text = "Loading: 20%";
                // Approve amount
                int allowance = await ContractRead<int>(Contracts.LinkToken, "allowance", walletAddress, utilsContractAddress);
                loadingText.text = "Loading: 25%";
                if (allowance < BigInteger.Parse(amountLinkToken))
                {
                    await ContractWrite(Contracts.LinkToken, "approve", marketplaceContractAddress, (amountLinkToken).ToString());
                }
                loadingText.text = "Loading: 30%";
                await ContractWrite(Contracts.Utils, "crossChainTransfer", destChain, tokenId, amount);
            }
            else
            {
                // Polygon ZKEVM LxLy Bridge uses chainId 1 for Polygon ZKEVM and 0 for Ethereum
                int destChainId = destChain == 11155111 ? 0 : 1;
                //if (destChain == 5)
                //{
                //    destChainId = 0;
                //}
                //else if (destChain == 1442)
                //{
                //    destChainId = 1;
                //}
                await ContractWrite(Contracts.Utils, "crossChainTransfer", destChainId, tokenId, amount, true /* fast bridge */ );
            }
            loadingText.text = "Loading: 100%";
            loadingText.enabled = false;
            return true;
        }
        catch (Exception e)
        {
            errorText = "ERROR!!!";
            isError = true;
            Debug.LogException(e);
            return false;
        }
    }

    public async Task<string> GetPrice(int listingId)
    {
        string price = await ContractRead<string>(Contracts.Marketplace, "getPrice", listingId);
        return price;
    }

    public async Task<string> GetHighestBid(int listingId)
    {
        List<object> highestBid = await ContractRead<List<object>>(Contracts.Map, "highestBid", listingId);
        return highestBid[1].ToString();
    }

    public List<Listing> GetListingsIndex(int xIndex, int yIndex)
    {
        if (listings == null)
        {
            return null;
        }
        return listings[xIndex, yIndex].listings;
    }

    public void ResetListingHighlights()
    {
        mapManager.destroyListingHighlights();
    }

    public async void OnWalletConnect()
    {
#if UNITY_WEBGL == true && UNITY_EDITOR == false
    SignIn ();
#endif
        uiController.connectWalletText.enabled = false;
        await setData();
    }

    public void OnWalletDisconnect()
    {
        uiController.connectWalletText.enabled = true;
        ResetData();
    }

    public async void OnSwitchNetwork()
    {
        ResetData();
#if UNITY_WEBGL == true && UNITY_EDITOR == false
    SignIn ();
#endif
        await setData();
    }
}
