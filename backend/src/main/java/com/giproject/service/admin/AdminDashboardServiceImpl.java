package com.giproject.service.admin;

import com.giproject.dto.admin.DashboardDataDTO;
import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.PaymentStatus;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final MemberRepository memberRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    public DashboardDataDTO getDashboardData() {
        long totalUsers = memberRepository.count() + cargoOwnerRepository.count();
        long newMembers = memberRepository.countByMemCreateIdDateTimeAfter(LocalDate.now().withDayOfMonth(1).atStartOfDay())
                + cargoOwnerRepository.countByCargoCreatedDateTimeAfter(LocalDate.now().withDayOfMonth(1).atStartOfDay());
        long totalDeliveries = deliveryRepository.count();

        long monthlyRevenue = paymentRepository.findAllByPaymentStatus(PaymentStatus.PAID).stream()
                .filter(p -> p.getPaidAt().getMonth() == LocalDate.now().getMonth())
                .mapToLong(p -> p.getOrderSheet().getMatching().getEstimate().getTotalCost())
                .sum();

        // Prepare last 6 months labels
        List<String> last6Months = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        YearMonth currentMonth = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            last6Months.add(currentMonth.minusMonths(i).format(formatter));
        }

        // Monthly Deliveries
        Map<String, Long> monthlyDeliveriesMap = deliveryRepository.findMonthlyDeliveries().stream()
                .collect(Collectors.toMap(obj -> (String)obj[0], obj -> (long)obj[1]));
        List<MonthlyDataDTO> monthlyDeliveries = last6Months.stream()
                .map(month -> new MonthlyDataDTO(month, monthlyDeliveriesMap.getOrDefault(month, 0L)))
                .collect(Collectors.toList());

        // New Members by Month
        Map<String, Long> newMembersByMonthMap = memberRepository.findNewMembersByMonth().stream()
                .collect(Collectors.toMap(obj -> (String)obj[0], obj -> (long)obj[1]));

        Map<String, Long> newCargoOwnersByMonthMap = cargoOwnerRepository.findNewCargoOwnersByMonth().stream()
                .collect(Collectors.toMap(obj -> (String)obj[0], obj -> (long)obj[1]));

        // Combine the two maps
        Map<String, Long> combinedNewMembersMap = newMembersByMonthMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue() + newCargoOwnersByMonthMap.getOrDefault(entry.getKey(), 0L)
                ));
        newCargoOwnersByMonthMap.forEach((key, value) -> combinedNewMembersMap.merge(key, value, Long::sum));


        List<MonthlyDataDTO> newMembersByMonth = last6Months.stream()
                .map(month -> new MonthlyDataDTO(month, combinedNewMembersMap.getOrDefault(month, 0L)))
                .collect(Collectors.toList());

        List<String> currentDeliveries = deliveryRepository.findTop5ByStatusOrderByCompletTimeDesc(DeliveryStatus.IN_TRANSIT).stream()
                .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress())
                .collect(Collectors.toList());

        List<String> pastDeliveries = deliveryRepository.findTop5ByStatusOrderByCompletTimeDesc(DeliveryStatus.COMPLETED).stream()
                .map(d -> d.getPayment().getOrderSheet().getStartRestAddress() + " -> " + d.getPayment().getOrderSheet().getEndRestAddress())
                .collect(Collectors.toList());

        return DashboardDataDTO.builder()
                .totalUsers(totalUsers)
                .monthlyRevenue(monthlyRevenue)
                .newMembers(newMembers)
                .totalDeliveries(totalDeliveries)
                .monthlyDeliveries(monthlyDeliveries)
                .newMembersByMonth(newMembersByMonth)
                .currentDeliveries(currentDeliveries)
                .pastDeliveries(pastDeliveries)
                .build();
    }
}