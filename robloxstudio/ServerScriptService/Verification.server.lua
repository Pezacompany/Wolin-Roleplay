local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local Teams = game:GetService("Teams")

local API_BASE_URL = "https://your-vercel-domain.vercel.app"
local ROBLOX_API_SECRET = "replace_with_same_secret_as_vercel"
local REQUEST_TIMEOUT_RETRIES = 2

local function buildAccessUrl(userId)
	return API_BASE_URL .. "/api/roblox/player-access?robloxUserId=" .. tostring(userId)
end

local function requestAccess(userId)
	local url = buildAccessUrl(userId)
	local lastError = nil

	for attempt = 1, REQUEST_TIMEOUT_RETRIES + 1 do
		local ok, response = pcall(function()
			return HttpService:RequestAsync({
				Url = url,
				Method = "GET",
				Headers = {
					Authorization = "Bearer " .. ROBLOX_API_SECRET
				}
			})
		end)

		if ok and response.Success then
			local decoded = HttpService:JSONDecode(response.Body)
			return decoded
		end

		lastError = ok and response.StatusCode or response
		task.wait(0.75 * attempt)
	end

	warn("Verification API unavailable: " .. tostring(lastError))
	return nil
end

local function assignTeam(player, access)
	if not access.assignment or not access.assignment.robloxTeamName then
		return
	end

	local team = Teams:FindFirstChild(access.assignment.robloxTeamName)
	if not team then
		warn("Configured team does not exist: " .. access.assignment.robloxTeamName)
		return
	end

	player.Team = team
end

Players.PlayerAdded:Connect(function(player)
	local access = requestAccess(player.UserId)

	if not access then
		player:Kick("Nie można teraz sprawdzić weryfikacji. Spróbuj ponownie za chwilę.")
		return
	end

	if access.verified ~= true then
		player:Kick("Musisz połączyć konto Roblox z Discordem komendą /weryfikuj.")
		return
	end

	assignTeam(player, access)
end)

