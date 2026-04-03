package com.giproject.controller.address;

import com.giproject.dto.address.AddressDTO.*;
import com.giproject.service.address.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/g2i4/address")
@RequiredArgsConstructor
@Validated
public class AddressController {

    private final AddressService addressService;

    @PostMapping("/simple")
    public ResponseEntity<SimpleAddressResponse> simple(@RequestBody SimpleAddressRequest req) {
        String result = addressService.simpleAddress(req.getAddress());
        return ResponseEntity.ok(new SimpleAddressResponse(result));
    }

    @PostMapping("/simple-batch")
    public ResponseEntity<BatchAddressResponse> simpleBatch(@RequestBody BatchAddressRequest req) {
        List<String> in = req.getAddresses() == null ? List.of() : req.getAddresses();
        List<String> out = new ArrayList<>(in.size());
        for (String addr : in) {
            out.add(addressService.simpleAddress(addr));
        }
        return ResponseEntity.ok(new BatchAddressResponse(out));
    }

    @PostMapping("/route")
    public ResponseEntity<RouteResponse> route(@RequestBody RouteRequest req) {
        String[] parts = addressService.parseRoute(req.getRoute());
        return ResponseEntity.ok(new RouteResponse(parts[0], parts[1]));
    }

    @PostMapping("/short")
    public ResponseEntity<SimpleAddressResponse> toShort(@RequestBody SimpleAddressRequest req) {
        String result = addressService.toShortAddress(req.getAddress());
        return ResponseEntity.ok(new SimpleAddressResponse(result));
    }
}